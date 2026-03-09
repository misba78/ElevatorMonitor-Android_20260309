package com.elevator.monitor

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.*
import android.bluetooth.le.*
import android.content.Context
import android.content.pm.PackageManager
import android.os.*
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.*
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.text.*
import androidx.compose.ui.text.font.*
import androidx.compose.ui.unit.*
import androidx.lifecycle.*
import androidx.activity.viewModels
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import org.json.JSONObject
import java.net.URL
import java.text.SimpleDateFormat
import java.util.*

// ═══════════════════════════════════════════════
//  BLE 상수  (ESP32 코드와 동일해야 함)
// ═══════════════════════════════════════════════
private const val TAG             = "ElevatorMonitor"
private const val DEVICE_NAME     = "ElevatorSelector"
private const val SERVICE_UUID    = "12345678-1234-1234-1234-123456789abc"
private const val CHAR_FLOOR_UUID = "12345678-1234-1234-1234-123456789abd"
private const val CCCD_UUID       = "00002902-0000-1000-8000-00805f9b34fb"

// ═══════════════════════════════════════════════
//  날씨 API  (https://openweathermap.org 무료 키)
// ═══════════════════════════════════════════════
private const val WEATHER_API_KEY = "YOUR_API_KEY_HERE"   // ← 여기에 API 키 입력
private const val WEATHER_CITY    = "Seoul"

// ═══════════════════════════════════════════════
//  데이터 모델
// ═══════════════════════════════════════════════
data class WeatherInfo(
    val temp       : Int,
    val feelsLike  : Int,
    val humidity   : Int,
    val description: String,
    val iconCode   : String
)

data class FloorRecord(val floor: Int, val time: String)

enum class BleStatus { SCANNING, CONNECTING, CONNECTED, DISCONNECTED }

// ═══════════════════════════════════════════════
//  ViewModel
// ═══════════════════════════════════════════════
class ElevatorViewModel : ViewModel() {
    val currentFloor  = MutableStateFlow(0)
    val bleStatus     = MutableStateFlow(BleStatus.DISCONNECTED)
    val weatherInfo   = MutableStateFlow<WeatherInfo?>(null)
    val currentTime   = MutableStateFlow("--:--:--")
    val currentDate   = MutableStateFlow("")
    val floorHistory  = MutableStateFlow<List<FloorRecord>>(emptyList())

    init {
        startClock()
        fetchWeather()
    }

    private fun startClock() {
        viewModelScope.launch {
            while (true) {
                val now = Date()
                currentTime.value = SimpleDateFormat("HH:mm:ss", Locale.KOREA).format(now)
                currentDate.value = SimpleDateFormat("yyyy년 MM월 dd일 (E)", Locale.KOREA).format(now)
                delay(1_000)
            }
        }
    }

    fun updateFloor(floor: Int) {
        currentFloor.value = floor
        val rec = FloorRecord(
            floor = floor,
            time  = SimpleDateFormat("HH:mm", Locale.KOREA).format(Date())
        )
        floorHistory.value = (listOf(rec) + floorHistory.value).take(10)
        Log.d(TAG, "층 수신: ${floor}층")
    }

    fun fetchWeather() {
        viewModelScope.launch(Dispatchers.IO) {
            runCatching {
                val url  = "https://api.openweathermap.org/data/2.5/weather" +
                    "?q=$WEATHER_CITY&appid=$WEATHER_API_KEY&units=metric&lang=kr"
                val json = JSONObject(URL(url).readText())
                val main = json.getJSONObject("main")
                val wthr = json.getJSONArray("weather").getJSONObject(0)
                WeatherInfo(
                    temp        = main.getDouble("temp").toInt(),
                    feelsLike   = main.getDouble("feels_like").toInt(),
                    humidity    = main.getInt("humidity"),
                    description = wthr.getString("description"),
                    iconCode    = wthr.getString("icon")
                )
            }.onSuccess { weatherInfo.value = it }
             .onFailure { Log.e(TAG, "날씨 오류: ${it.message}") }
        }
    }
}

// ═══════════════════════════════════════════════
//  MainActivity  (BLE 스캔 / GATT / 권한)
// ═══════════════════════════════════════════════
@SuppressLint("MissingPermission")
class MainActivity : ComponentActivity() {

    private val vm     : ElevatorViewModel by viewModels()
    private var gatt   : BluetoothGatt?     = null
    private var scanner: BluetoothLeScanner? = null
    private val handler = Handler(Looper.getMainLooper())
    private var scanning = false

    private val permLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->
        if (results.values.all { it }) startBleScan()
        else Log.w(TAG, "권한 거부됨")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { AppTheme { ElevatorScreen(vm) } }
        requestPermissions()
    }

    // ── 권한 요청 ──────────────────────────────
    private fun requestPermissions() {
        val perms = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.INTERNET
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            perms += Manifest.permission.BLUETOOTH_SCAN
            perms += Manifest.permission.BLUETOOTH_CONNECT
        }
        permLauncher.launch(perms.toTypedArray())
    }

    // ── BLE 스캔 시작 ──────────────────────────
    private fun startBleScan() {
        val adapter = (getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager).adapter
        scanner  = adapter.bluetoothLeScanner
        scanning = true
        vm.bleStatus.value = BleStatus.SCANNING

        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build()
        val filter = ScanFilter.Builder().setDeviceName(DEVICE_NAME).build()
        scanner?.startScan(listOf(filter), settings, scanCallback)
        Log.d(TAG, "BLE 스캔 시작")

        // 15초 후 타임아웃 → 재시도
        handler.postDelayed({
            if (scanning) {
                scanner?.stopScan(scanCallback); scanning = false
                if (vm.bleStatus.value != BleStatus.CONNECTED) {
                    handler.postDelayed({ startBleScan() }, 2_000)
                }
            }
        }, 15_000)
    }

    // ── 스캔 콜백 ──────────────────────────────
    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            Log.d(TAG, "장치 발견: ${result.device.address}")
            scanner?.stopScan(this); scanning = false
            vm.bleStatus.value = BleStatus.CONNECTING
            gatt = result.device.connectGatt(this@MainActivity, false, gattCallback)
        }
        override fun onScanFailed(errorCode: Int) {
            Log.e(TAG, "스캔 실패 code=$errorCode")
            vm.bleStatus.value = BleStatus.DISCONNECTED
        }
    }

    // ── GATT 콜백 ──────────────────────────────
    private val gattCallback = object : BluetoothGattCallback() {
        override fun onConnectionStateChange(g: BluetoothGatt, status: Int, newState: Int) {
            when (newState) {
                BluetoothProfile.STATE_CONNECTED -> {
                    Log.d(TAG, "GATT 연결 성공")
                    vm.bleStatus.value = BleStatus.CONNECTED
                    g.discoverServices()
                }
                BluetoothProfile.STATE_DISCONNECTED -> {
                    Log.d(TAG, "GATT 연결 끊김 → 3초 후 재스캔")
                    vm.bleStatus.value = BleStatus.DISCONNECTED
                    gatt?.close(); gatt = null
                    handler.postDelayed({ startBleScan() }, 3_000)
                }
            }
        }

        override fun onServicesDiscovered(g: BluetoothGatt, status: Int) {
            if (status != BluetoothGatt.GATT_SUCCESS) return
            val svc  = g.getService(UUID.fromString(SERVICE_UUID))       ?: return
            val char = svc.getCharacteristic(UUID.fromString(CHAR_FLOOR_UUID)) ?: return

            // Notify 구독
            g.setCharacteristicNotification(char, true)
            char.getDescriptor(UUID.fromString(CCCD_UUID))?.let { desc ->
                @Suppress("DEPRECATION")
                desc.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                g.writeDescriptor(desc)
            }
            Log.d(TAG, "Notify 구독 완료")
        }

        @Suppress("DEPRECATION")
        override fun onCharacteristicChanged(
            g: BluetoothGatt,
            char: BluetoothGattCharacteristic
        ) {
            if (char.uuid.toString().lowercase() == CHAR_FLOOR_UUID.lowercase()) {
                val floor = char.getStringValue(0)?.trim()?.toIntOrNull() ?: return
                vm.updateFloor(floor)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        gatt?.close(); gatt = null
        if (scanning) scanner?.stopScan(scanCallback)
    }
}

// ═══════════════════════════════════════════════
//  Compose UI
// ═══════════════════════════════════════════════

fun weatherEmoji(icon: String) = when {
    icon.startsWith("01") -> "☀️"
    icon.startsWith("02") -> "🌤"
    icon.startsWith("03") -> "☁️"
    icon.startsWith("04") -> "☁️"
    icon.startsWith("09") -> "🌧"
    icon.startsWith("10") -> "🌦"
    icon.startsWith("11") -> "⛈"
    icon.startsWith("13") -> "❄️"
    icon.startsWith("50") -> "🌫"
    else                  -> "🌡"
}

fun floorColor(floor: Int) = when {
    floor == 0  -> Color(0xFF37474F)
    floor <= 17 -> Color(0xFF1565C0)
    floor <= 34 -> Color(0xFF0277BD)
    else        -> Color(0xFF00838F)
}

@Composable
fun AppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            background = Color(0xFF080818),
            surface    = Color(0xFF10102A),
            primary    = Color(0xFF2196F3),
        ),
        content = content
    )
}

// ── 메인 화면 ──────────────────────────────────
@Composable
fun ElevatorScreen(vm: ElevatorViewModel) {
    val floor   by vm.currentFloor.collectAsState()
    val status  by vm.bleStatus.collectAsState()
    val weather by vm.weatherInfo.collectAsState()
    val time    by vm.currentTime.collectAsState()
    val date    by vm.currentDate.collectAsState()
    val history by vm.floorHistory.collectAsState()

    val animFloor by animateIntAsState(
        targetValue   = floor,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
        label         = "floor"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF080818))
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        TopBar(time, date, weather, status, vm::fetchWeather)
        FloorCard(animFloor, status, Modifier.weight(1f))
        if (history.isNotEmpty()) HistoryRow(history)
    }
}

// ── 상단 바 ────────────────────────────────────
@Composable
fun TopBar(
    time      : String,
    date      : String,
    weather   : WeatherInfo?,
    bleStatus : BleStatus,
    onRefresh : () -> Unit
) {
    Card(
        modifier  = Modifier.fillMaxWidth(),
        colors    = CardDefaults.cardColors(containerColor = Color(0xFF10102A)),
        shape     = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(6.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment     = Alignment.CenterVertically
        ) {
            // 시계
            Column {
                Text(
                    text          = time,
                    fontSize      = 30.sp,
                    fontWeight    = FontWeight.Black,
                    color         = Color.White,
                    fontFamily    = FontFamily.Monospace,
                    letterSpacing = 1.sp
                )
                Text(text = date, fontSize = 11.sp, color = Color(0xFF546E7A))
            }

            // 날씨
            if (weather != null) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.clickable { onRefresh() }
                ) {
                    Text(weatherEmoji(weather.iconCode), fontSize = 26.sp)
                    Text(
                        text       = "${weather.temp}°C",
                        fontSize   = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color      = Color(0xFF42A5F5)
                    )
                    Text(weather.description, fontSize = 10.sp, color = Color(0xFF546E7A))
                    Text(
                        text     = "💧${weather.humidity}%  체감${weather.feelsLike}°",
                        fontSize = 9.sp,
                        color    = Color(0xFF455A64)
                    )
                }
            } else {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.clickable { onRefresh() }
                ) {
                    Text("🌡", fontSize = 26.sp)
                    Text("날씨 로딩중", fontSize = 10.sp, color = Color(0xFF546E7A))
                }
            }

            // BLE 상태
            BleIndicator(bleStatus)
        }
    }
}

// ── BLE 상태 인디케이터 ─────────────────────────
@Composable
fun BleIndicator(status: BleStatus) {
    val (dotColor, label) = when (status) {
        BleStatus.CONNECTED    -> Color(0xFF00BCD4) to "연결됨"
        BleStatus.CONNECTING   -> Color(0xFFFFC107) to "연결중"
        BleStatus.SCANNING     -> Color(0xFF7E57C2) to "스캔중"
        BleStatus.DISCONNECTED -> Color(0xFFEF5350) to "끊김"
    }
    val blinking = status == BleStatus.SCANNING || status == BleStatus.CONNECTING
    val alpha by rememberInfiniteTransition(label = "ble").animateFloat(
        initialValue  = 1f,
        targetValue   = if (blinking) 0.2f else 1f,
        animationSpec = infiniteRepeatable(tween(700), RepeatMode.Reverse),
        label         = "bleAlpha"
    )
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier            = Modifier.alpha(if (blinking) alpha else 1f)
    ) {
        Box(
            modifier = Modifier
                .size(12.dp)
                .clip(CircleShape)
                .background(dotColor)
        )
        Spacer(Modifier.height(3.dp))
        Text("BLE", fontSize = 9.sp, color = Color(0xFF37474F))
        Text(label, fontSize = 10.sp, color = dotColor, fontWeight = FontWeight.SemiBold)
    }
}

// ── 층 메인 카드 ─────────────────────────────────
@Composable
fun FloorCard(floor: Int, bleStatus: BleStatus, modifier: Modifier = Modifier) {
    val fColor    = floorColor(floor)
    val connected = bleStatus == BleStatus.CONNECTED

    val glowAlpha by rememberInfiniteTransition(label = "glow").animateFloat(
        initialValue  = 0.10f,
        targetValue   = if (connected && floor > 0) 0.22f else 0.06f,
        animationSpec = infiniteRepeatable(tween(2200), RepeatMode.Reverse),
        label         = "glowAlpha"
    )

    Card(
        modifier  = modifier.fillMaxWidth(),
        colors    = CardDefaults.cardColors(containerColor = Color(0xFF10102A)),
        shape     = RoundedCornerShape(22.dp),
        elevation = CardDefaults.cardElevation(10.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(fColor.copy(alpha = glowAlpha), Color.Transparent),
                        radius = 900f
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // 상태 태그
                Surface(
                    shape  = RoundedCornerShape(20.dp),
                    color  = fColor.copy(alpha = 0.13f),
                    border = BorderStroke(1.dp, fColor.copy(alpha = 0.35f))
                ) {
                    Text(
                        text     = if (floor == 0) "  ESP32 대기 중  " else "  🛗  목적지  ",
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 5.dp),
                        fontSize = 13.sp,
                        color    = if (floor == 0) Color(0xFF546E7A) else fColor,
                        fontWeight = FontWeight.Medium
                    )
                }

                Spacer(Modifier.height(10.dp))

                // 층 번호
                Text(
                    text       = if (floor == 0) "--" else "$floor",
                    fontSize   = 120.sp,
                    fontWeight = FontWeight.Black,
                    color      = if (floor == 0) Color(0xFF263238) else Color.White,
                    lineHeight = 120.sp,
                    style      = TextStyle(
                        shadow = if (floor > 0) Shadow(
                            color      = fColor.copy(alpha = 0.85f),
                            offset     = Offset(0f, 4f),
                            blurRadius = 45f
                        ) else null
                    )
                )

                // 단위 텍스트
                Text(
                    text          = if (floor == 0) "연결을 기다리는 중..." else "층",
                    fontSize      = if (floor == 0) 13.sp else 20.sp,
                    color         = Color(0xFF546E7A),
                    fontWeight    = FontWeight.Medium,
                    letterSpacing = if (floor == 0) 0.sp else 4.sp
                )

                Spacer(Modifier.height(22.dp))

                // 컬러 바
                Box(
                    modifier = Modifier
                        .width(72.dp)
                        .height(4.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(
                            Brush.horizontalGradient(
                                listOf(
                                    fColor.copy(alpha = 0.2f),
                                    fColor,
                                    fColor.copy(alpha = 0.2f)
                                )
                            )
                        )
                )
            }
        }
    }
}

// ── 이력 행 ───────────────────────────────────
@Composable
fun HistoryRow(history: List<FloorRecord>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors   = CardDefaults.cardColors(containerColor = Color(0xFF10102A)),
        shape    = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(
                text          = "최근 이력",
                fontSize      = 11.sp,
                color         = Color(0xFF546E7A),
                fontWeight    = FontWeight.Medium,
                letterSpacing = 1.sp
            )
            Spacer(Modifier.height(8.dp))
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.horizontalScroll(rememberScrollState())
            ) {
                history.forEachIndexed { idx, rec ->
                    val fade  = (1f - idx * 0.09f).coerceAtLeast(0.2f)
                    val color = floorColor(rec.floor)
                    Box(
                        modifier = Modifier
                            .size(width = 50.dp, height = 58.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(color.copy(alpha = fade * 0.15f))
                            .border(BorderStroke(1.dp, color.copy(alpha = fade * 0.4f)), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text       = "${rec.floor}",
                                fontSize   = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color      = Color.White.copy(alpha = fade)
                            )
                            Text(
                                text     = rec.time,
                                fontSize = 9.sp,
                                color    = Color(0xFF546E7A)
                            )
                        }
                    }
                }
            }
        }
    }
}
