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
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.*
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.text.*
import androidx.compose.ui.text.font.*
import androidx.compose.ui.unit.*
import androidx.lifecycle.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import org.json.JSONObject
import java.net.URL
import java.text.SimpleDateFormat
import java.util.*

// ═══════════════════════════════════════════════
//  BLE 상수
// ═══════════════════════════════════════════════
private const val TAG             = "ElevatorMonitor"
private const val DEVICE_NAME     = "ElevatorSelector"
private const val SERVICE_UUID    = "12345678-1234-1234-1234-123456789abc"
private const val CHAR_FLOOR_UUID = "12345678-1234-1234-1234-123456789abd"
private const val CCCD_UUID       = "00002902-0000-1000-8000-00805f9b34fb"

// ═══════════════════════════════════════════════
//  날씨 API
// ═══════════════════════════════════════════════
private const val WEATHER_API_KEY = "YOUR_API_KEY_HERE"
private const val WEATHER_CITY    = "Seoul"

// ═══════════════════════════════════════════════
//  엘리베이터 물리 상수
//  속도 240m/min = 4m/s, 층간 거리 3m → 층당 0.75초
// ═══════════════════════════════════════════════
private const val FLOOR_HEIGHT_M     = 3.0      // 층간 거리 (m)
private const val SPEED_M_PER_SEC    = 4.0      // 240m/min → 4m/s
private const val MS_PER_FLOOR       = (FLOOR_HEIGHT_M / SPEED_M_PER_SEC * 1000).toLong() // 750ms

// ═══════════════════════════════════════════════
//  데이터 모델
// ═══════════════════════════════════════════════
data class WeatherInfo(
    val temp: Int, val feelsLike: Int, val humidity: Int,
    val description: String, val iconCode: String
)

data class FloorRecord(val floor: Int, val time: String)

enum class BleStatus { SCANNING, CONNECTING, CONNECTED, DISCONNECTED }

enum class ElevatorDirection { IDLE, UP, DOWN }

enum class DoorState { CLOSED, OPENING, OPEN, CLOSING }

// ═══════════════════════════════════════════════
//  ViewModel
// ═══════════════════════════════════════════════
class ElevatorViewModel : ViewModel() {
    val displayFloor = MutableStateFlow(1)
    val targetFloor  = MutableStateFlow(1)
    val direction    = MutableStateFlow(ElevatorDirection.IDLE)
    val isMoving     = MutableStateFlow(false)
    val doorState    = MutableStateFlow(DoorState.CLOSED)
    val doorProgress = MutableStateFlow(0f)

    val bleStatus    = MutableStateFlow(BleStatus.DISCONNECTED)
    val weatherInfo  = MutableStateFlow<WeatherInfo?>(null)
    val currentTime  = MutableStateFlow("--:--:--")
    val currentDate  = MutableStateFlow("")
    val floorHistory = MutableStateFlow<List<FloorRecord>>(emptyList())

    // 이동 중 목적지 변경을 위한 채널 (while 루프가 감지)
    private val newTargetChannel = kotlinx.coroutines.channels.Channel<Int>(
        capacity = kotlinx.coroutines.channels.Channel.CONFLATED
    )
    private var mainJob: Job? = null

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

    // BLE에서 목적층 수신 시 호출
    fun setTargetFloor(floor: Int) {
        // 이력 추가 (중복 제거 후 맨 앞에 삽입)
        val rec = FloorRecord(floor, SimpleDateFormat("HH:mm", Locale.KOREA).format(Date()))
        floorHistory.value = (listOf(rec) + floorHistory.value.filter { it.floor != floor }).take(10)

        if (mainJob?.isActive == true) {
            // ── 엘리베이터 동작 중(도어 포함): 목적지만 변경, 도어 재실행 없음 ──
            targetFloor.value = floor
            newTargetChannel.trySend(floor)
        } else {
            // ── 완전 정지 중: 새 시퀀스 시작 ──
            targetFloor.value = floor
            mainJob = viewModelScope.launch { runElevator(floor) }
        }
    }

    // 도어 progress 코루틴 직접 제어 (0f→1f or 1f→0f)
    private suspend fun animateDoor(from: Float, to: Float, durationMs: Long) {
        val intervalMs = 16L
        val steps      = (durationMs / intervalMs).toInt()
        val delta      = (to - from) / steps
        var cur        = from
        repeat(steps) {
            cur = (cur + delta).coerceIn(0f, 1f)
            doorProgress.value = cur
            delay(intervalMs)
        }
        doorProgress.value = to
    }

    private suspend fun runElevator(initialTarget: Int) {
        var target = initialTarget

        // ── 출발층 도어 열림 → 닫힘 ──
        // 이 단계에서도 새 층이 들어오면 Channel에 쌓임 (도어는 그대로 진행)
        doorProgress.value = 0f
        doorState.value    = DoorState.OPENING
        animateDoor(0f, 1f, 4_000)
        doorState.value    = DoorState.OPEN
        delay(500)
        doorState.value    = DoorState.CLOSING
        animateDoor(1f, 0f, 4_000)
        doorState.value    = DoorState.CLOSED
        delay(100)

        // 도어 닫힘 완료 후 채널에 쌓인 최신 목적지 반영
        newTargetChannel.tryReceive().getOrNull()?.let { newFloor ->
            target = newFloor
            targetFloor.value = newFloor
        }

        // ── 층 이동: displayFloor가 target에 도달할 때까지 ──
        isMoving.value = true
        while (displayFloor.value != target) {
            val cur  = displayFloor.value
            val step = if (target > cur) 1 else -1
            direction.value    = if (step > 0) ElevatorDirection.UP else ElevatorDirection.DOWN
            displayFloor.value = cur + step

            delay(MS_PER_FLOOR)

            // 매 층 이동 후 새 목적지 확인 (도어 없이 방향만 바꿈)
            newTargetChannel.tryReceive().getOrNull()?.let { newFloor ->
                target = newFloor
                targetFloor.value = newFloor
            }
        }

        isMoving.value  = false
        direction.value = ElevatorDirection.IDLE

        // ── 도착층 도어 열림 → 닫힘 ──
        doorProgress.value = 0f
        doorState.value    = DoorState.OPENING
        animateDoor(0f, 1f, 4_000)
        doorState.value    = DoorState.OPEN
        delay(500)
        doorState.value    = DoorState.CLOSING
        animateDoor(1f, 0f, 4_000)
        doorState.value    = DoorState.CLOSED

        // 도착층 이력 삭제
        floorHistory.value = floorHistory.value.filterNot { it.floor == target }
        Log.d(TAG, "도착 완료: $target 층")

        // 도착층 도어 열리는 동안 또 새 층이 눌렸으면 연속 처리
        newTargetChannel.tryReceive().getOrNull()?.let { nextFloor ->
            targetFloor.value = nextFloor
            mainJob = viewModelScope.launch { runElevator(nextFloor) }
        }
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
//  MainActivity
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

    private fun startBleScan() {
        val adapter = (getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager).adapter
        scanner  = adapter.bluetoothLeScanner
        scanning = true
        vm.bleStatus.value = BleStatus.SCANNING

        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build()
        val filter = ScanFilter.Builder().setDeviceName(DEVICE_NAME).build()
        scanner?.startScan(listOf(filter), settings, scanCallback)

        handler.postDelayed({
            if (scanning) {
                scanner?.stopScan(scanCallback); scanning = false
                if (vm.bleStatus.value != BleStatus.CONNECTED)
                    handler.postDelayed({ startBleScan() }, 2_000)
            }
        }, 15_000)
    }

    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            scanner?.stopScan(this); scanning = false
            vm.bleStatus.value = BleStatus.CONNECTING
            gatt = result.device.connectGatt(this@MainActivity, false, gattCallback)
        }
        override fun onScanFailed(errorCode: Int) {
            vm.bleStatus.value = BleStatus.DISCONNECTED
        }
    }

    private val gattCallback = object : BluetoothGattCallback() {
        override fun onConnectionStateChange(g: BluetoothGatt, status: Int, newState: Int) {
            when (newState) {
                BluetoothProfile.STATE_CONNECTED -> {
                    vm.bleStatus.value = BleStatus.CONNECTED
                    g.discoverServices()
                }
                BluetoothProfile.STATE_DISCONNECTED -> {
                    vm.bleStatus.value = BleStatus.DISCONNECTED
                    gatt?.close(); gatt = null
                    handler.postDelayed({ startBleScan() }, 3_000)
                }
            }
        }

        override fun onServicesDiscovered(g: BluetoothGatt, status: Int) {
            if (status != BluetoothGatt.GATT_SUCCESS) return
            val svc  = g.getService(UUID.fromString(SERVICE_UUID))           ?: return
            val char = svc.getCharacteristic(UUID.fromString(CHAR_FLOOR_UUID)) ?: return
            g.setCharacteristicNotification(char, true)
            char.getDescriptor(UUID.fromString(CCCD_UUID))?.let { desc ->
                @Suppress("DEPRECATION")
                desc.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                g.writeDescriptor(desc)
            }
        }

        @Suppress("DEPRECATION")
        override fun onCharacteristicChanged(g: BluetoothGatt, char: BluetoothGattCharacteristic) {
            if (char.uuid.toString().lowercase() == CHAR_FLOOR_UUID.lowercase()) {
                val floor = char.getStringValue(0)?.trim()?.toIntOrNull() ?: return
                vm.setTargetFloor(floor)
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
//  Compose UI  (전통 엘리베이터 디스플레이 디자인)
// ═══════════════════════════════════════════════

fun weatherEmoji(icon: String) = when {
    icon.startsWith("01") -> "☀"
    icon.startsWith("02") -> "⛅"
    icon.startsWith("03") -> "☁"
    icon.startsWith("04") -> "☁"
    icon.startsWith("09") -> "🌧"
    icon.startsWith("10") -> "🌦"
    icon.startsWith("11") -> "⛈"
    icon.startsWith("13") -> "❄"
    icon.startsWith("50") -> "🌫"
    else                  -> "🌡"
}

@Composable
fun AppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            background = Color(0xFF8B0000),
            surface    = Color(0xFF6B0000),
            primary    = Color(0xFFD4AF37),
        ),
        content = content
    )
}

// ── 메인 화면 ──────────────────────────────────
@Composable
fun ElevatorScreen(vm: ElevatorViewModel) {
    val displayFloor by vm.displayFloor.collectAsState()
    val targetFloor  by vm.targetFloor.collectAsState()
    val direction    by vm.direction.collectAsState()
    val isMoving     by vm.isMoving.collectAsState()
    val bleStatus    by vm.bleStatus.collectAsState()
    val weather      by vm.weatherInfo.collectAsState()
    val time         by vm.currentTime.collectAsState()
    val date         by vm.currentDate.collectAsState()
    val history      by vm.floorHistory.collectAsState()
    val doorState    by vm.doorState.collectAsState()
    val doorProgress by vm.doorProgress.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(Color(0xFF6B0000), Color(0xFF8B0000), Color(0xFF6B0000))
                )
            )
    ) {
        Column(modifier = Modifier.fillMaxSize()) {

            // ── 상단 메인 영역 (층 표시) ──
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                // 배경 구름 장식
                CloudDecoration()

                // 좌우 상단 격자 문양
                CornerPatterns()

                // 층 표시 + 화살표
                Column(
                    modifier            = Modifier.fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Spacer(Modifier.height(24.dp))

                    // 방향 화살표
                    DirectionArrowNew(direction = direction)

                    Spacer(Modifier.height(8.dp))

                    // 층 번호 + F
                    Row(
                        verticalAlignment = Alignment.Bottom,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text       = "$displayFloor",
                            fontSize   = 140.sp,
                            fontWeight = FontWeight.Black,
                            color      = Color(0xFFD4AF37),
                            lineHeight = 140.sp,
                            style      = TextStyle(
                                shadow = Shadow(
                                    color      = Color(0xFF8B6914).copy(alpha = 0.8f),
                                    offset     = Offset(4f, 6f),
                                    blurRadius = 12f
                                )
                            )
                        )
                        Text(
                            text       = "F",
                            fontSize   = 100.sp,
                            fontWeight = FontWeight.Black,
                            color      = Color(0xFFD4AF37),
                            lineHeight = 160.sp,
                            style      = TextStyle(
                                shadow = Shadow(
                                    color      = Color(0xFF8B6914).copy(alpha = 0.8f),
                                    offset     = Offset(4f, 6f),
                                    blurRadius = 12f
                                )
                            )
                        )
                    }

                    Spacer(Modifier.height(12.dp))

                    // 상태 텍스트
                    StatusTextNew(
                        direction = direction,
                        isMoving  = isMoving,
                        history   = history,
                        doorState = doorState
                    )
                }

                // BLE 상태 (우상단)
                BleIndicatorNew(
                    status   = bleStatus,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(top = 48.dp, end = 16.dp)
                )
            }

            // ── 하단 정보 카드 ──
            BottomInfoCard(
                time        = time,
                date        = date,
                weather     = weather,
                doorState   = doorState,
                doorProgress= doorProgress,
                onRefresh   = vm::fetchWeather
            )

            // ── 공지 스크롤 배너 ──
            if (history.isNotEmpty()) {
                NoticeBanner(history = history)
            }
        }
    }
}

// ── 구름 배경 장식 ──────────────────────────────
@Composable
fun CloudDecoration() {
    val infiniteTransition = rememberInfiniteTransition(label = "cloud")
    val cloudOffset by infiniteTransition.animateFloat(
        initialValue  = 0f,
        targetValue   = 10f,
        animationSpec = infiniteRepeatable(tween(3000, easing = FastOutSlowInEasing), RepeatMode.Reverse),
        label         = "cloudOffset"
    )
    Canvas(modifier = Modifier.fillMaxSize()) {
        val cw = size.width
        val ch = size.height

        // 왼쪽 구름
        drawCircle(Color(0xFFAA0000).copy(alpha = 0.5f), radius = 60f,
            center = Offset(80f, ch * 0.55f + cloudOffset))
        drawCircle(Color(0xFFAA0000).copy(alpha = 0.4f), radius = 45f,
            center = Offset(130f, ch * 0.53f + cloudOffset))
        drawCircle(Color(0xFFBB1111).copy(alpha = 0.3f), radius = 35f,
            center = Offset(50f, ch * 0.58f + cloudOffset))

        // 오른쪽 구름
        drawCircle(Color(0xFFAA0000).copy(alpha = 0.5f), radius = 55f,
            center = Offset(cw - 80f, ch * 0.60f - cloudOffset))
        drawCircle(Color(0xFFAA0000).copy(alpha = 0.4f), radius = 40f,
            center = Offset(cw - 130f, ch * 0.58f - cloudOffset))
        drawCircle(Color(0xFFBB1111).copy(alpha = 0.3f), radius = 30f,
            center = Offset(cw - 50f, ch * 0.63f - cloudOffset))
    }
}

// ── 모서리 격자 문양 ─────────────────────────────
@Composable
fun CornerPatterns() {
    Canvas(modifier = Modifier.fillMaxSize().padding(12.dp)) {
        val gold   = Color(0xFFD4AF37)
        val stroke = 2.5f
        val s      = 48f   // 격자 크기
        val gap    = 8f

        fun drawGrid(ox: Float, oy: Float) {
            val cols = 3; val rows = 3
            for (r in 0 until rows) {
                for (c in 0 until cols) {
                    val x = ox + c * (gap + stroke)
                    val y = oy + r * (gap + stroke)
                    drawRect(gold.copy(alpha = 0.7f),
                        topLeft = Offset(x, y),
                        size    = androidx.compose.ui.geometry.Size(stroke * 2, stroke * 2))
                }
            }
            // 격자 테두리
            drawRect(gold.copy(alpha = 0.5f),
                topLeft = Offset(ox - 4, oy - 4),
                size    = androidx.compose.ui.geometry.Size(s, s),
                style   = androidx.compose.ui.graphics.drawscope.Stroke(width = 1.5f))
        }

        drawGrid(8f, 8f)                          // 좌상단
        drawGrid(size.width - s - 8f, 8f)        // 우상단
    }
}

// ── 방향 화살표 (새 디자인) ─────────────────────
@Composable
fun DirectionArrowNew(direction: ElevatorDirection) {
    val infiniteTransition = rememberInfiniteTransition(label = "arrow")
    val arrowAlpha by infiniteTransition.animateFloat(
        initialValue  = 1f,
        targetValue   = if (direction != ElevatorDirection.IDLE) 0.2f else 1f,
        animationSpec = infiniteRepeatable(tween(600), RepeatMode.Reverse),
        label         = "arrowAlpha"
    )
    val arrowOffset by infiniteTransition.animateFloat(
        initialValue  = 0f,
        targetValue   = if (direction != ElevatorDirection.IDLE) -12f else 0f,
        animationSpec = infiniteRepeatable(tween(600), RepeatMode.Reverse),
        label         = "arrowY"
    )

    when (direction) {
        ElevatorDirection.UP -> {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.offset(y = arrowOffset.dp).alpha(arrowAlpha)
            ) {
                // 이중 화살표
                Text("▲", fontSize = 28.sp, color = Color(0xFFCC2200))
                Text("▲", fontSize = 36.sp, color = Color(0xFFDD3300))
            }
        }
        ElevatorDirection.DOWN -> {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.offset(y = (-arrowOffset).dp).alpha(arrowAlpha)
            ) {
                Text("▼", fontSize = 36.sp, color = Color(0xFFDD3300))
                Text("▼", fontSize = 28.sp, color = Color(0xFFCC2200))
            }
        }
        ElevatorDirection.IDLE -> {
            Box(modifier = Modifier.height(64.dp))  // 자리 확보
        }
    }
}

// ── 상태 텍스트 (새 디자인) ─────────────────────
@Composable
fun StatusTextNew(
    direction : ElevatorDirection,
    isMoving  : Boolean,
    history   : List<FloorRecord>,
    doorState : DoorState
) {
    val goldLight = Color(0xFFE8C84A)
    val goldDim   = Color(0xFFB8942A)

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        when {
            doorState == DoorState.OPENING || doorState == DoorState.OPEN -> {
                Text("도어 열림", fontSize = 18.sp, color = Color(0xFF88EE88),
                    fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
            }
            doorState == DoorState.CLOSING -> {
                Text("도어 닫힘", fontSize = 18.sp, color = Color(0xFFEE8888),
                    fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
            }
            isMoving -> {
                Text(
                    text          = if (direction == ElevatorDirection.UP) "상승 중" else "하강 중",
                    fontSize      = 20.sp,
                    color         = goldLight,
                    fontWeight    = FontWeight.Bold,
                    letterSpacing = 3.sp
                )
                if (history.isNotEmpty()) {
                    Spacer(Modifier.height(4.dp))
                    val targets = history.joinToString(", ") { "${it.floor}" }
                    Text(
                        text       = "목적층  $targets",
                        fontSize   = 16.sp,
                        color      = goldDim,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
            else -> {
                Text("대기 중", fontSize = 18.sp, color = goldDim,
                    fontWeight = FontWeight.Medium, letterSpacing = 2.sp)
            }
        }
    }
}

// ── BLE 인디케이터 (새) ─────────────────────────
@Composable
fun BleIndicatorNew(status: BleStatus, modifier: Modifier = Modifier) {
    val (color, label) = when (status) {
        BleStatus.CONNECTED    -> Color(0xFF88EE88) to "BLE"
        BleStatus.CONNECTING   -> Color(0xFFFFCC44) to "연결중"
        BleStatus.SCANNING     -> Color(0xFFCC88FF) to "스캔"
        BleStatus.DISCONNECTED -> Color(0xFFFF6666) to "끊김"
    }
    val blinking = status != BleStatus.CONNECTED
    val alpha by rememberInfiniteTransition(label = "ble").animateFloat(
        initialValue  = 1f,
        targetValue   = if (blinking) 0.3f else 1f,
        animationSpec = infiniteRepeatable(tween(800), RepeatMode.Reverse),
        label         = "bleA"
    )
    Column(
        modifier            = modifier.alpha(if (blinking) alpha else 1f),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(Modifier.size(8.dp).clip(CircleShape).background(color))
        Spacer(Modifier.height(2.dp))
        Text(label, fontSize = 9.sp, color = color, fontWeight = FontWeight.Bold)
    }
}

// ── 하단 정보 카드 ──────────────────────────────
@Composable
fun BottomInfoCard(
    time        : String,
    date        : String,
    weather     : WeatherInfo?,
    doorState   : DoorState,
    doorProgress: Float,
    onRefresh   : () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF1A1A1A))
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        Row(
            modifier              = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment     = Alignment.CenterVertically
        ) {
            // 왼쪽: 시간/날씨
            Column(modifier = Modifier.weight(1f)) {
                // 시간 + 날짜
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text       = time.substring(0, 5),   // HH:mm
                        fontSize   = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color      = Color.White,
                        fontFamily = FontFamily.Monospace
                    )
                    Spacer(Modifier.width(8.dp))
                    Text("│", fontSize = 16.sp, color = Color(0xFF444444))
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text     = date,
                        fontSize = 12.sp,
                        color    = Color(0xFFAAAAAA)
                    )
                }

                Spacer(Modifier.height(8.dp))

                // 날씨
                if (weather != null) {
                    Row(
                        verticalAlignment     = Alignment.CenterVertically,
                        modifier              = Modifier.clickable { onRefresh() }
                    ) {
                        Text(weatherEmoji(weather.iconCode), fontSize = 28.sp)
                        Spacer(Modifier.width(8.dp))
                        Text(
                            text       = "${weather.temp}°C",
                            fontSize   = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color      = Color(0xFFFFCC44)
                        )
                        Spacer(Modifier.width(8.dp))
                        Text(
                            text     = weather.description,
                            fontSize = 11.sp,
                            color    = Color(0xFF888888)
                        )
                    }
                } else {
                    Text("날씨 로딩 중...", fontSize = 12.sp, color = Color(0xFF666666),
                        modifier = Modifier.clickable { onRefresh() })
                }
            }

            // 오른쪽: 도어 위젯 (원형 게이지 스타일)
            DoorGauge(
                doorState    = doorState,
                doorProgress = doorProgress
            )
        }
    }
}

// ── 도어 원형 게이지 ─────────────────────────────
@Composable
fun DoorGauge(doorState: DoorState, doorProgress: Float) {
    val openFraction = doorProgress.coerceIn(0f, 1f)

    val arcColor = when (doorState) {
        DoorState.OPENING, DoorState.OPEN -> Color(0xFF88EE88)
        DoorState.CLOSING                 -> Color(0xFFFF6644)
        DoorState.CLOSED                  -> Color(0xFF444444)
    }
    val labelText = when (doorState) {
        DoorState.OPENING -> "열림"
        DoorState.OPEN    -> "열림"
        DoorState.CLOSING -> "닫힘"
        DoorState.CLOSED  -> "도어"
    }

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text("도어", fontSize = 10.sp, color = Color(0xFF888888))
        Spacer(Modifier.height(4.dp))
        Box(
            modifier        = Modifier.size(72.dp),
            contentAlignment = Alignment.Center
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val stroke = 7f
                val sweep  = openFraction * 300f
                val start  = -240f

                // 배경 트랙
                drawArc(
                    color      = Color(0xFF333333),
                    startAngle = start,
                    sweepAngle = 300f,
                    useCenter  = false,
                    style      = androidx.compose.ui.graphics.drawscope.Stroke(
                        width = stroke,
                        cap   = androidx.compose.ui.graphics.StrokeCap.Round
                    )
                )
                // 진행 아크
                if (sweep > 0f) {
                    drawArc(
                        color      = arcColor,
                        startAngle = start,
                        sweepAngle = sweep,
                        useCenter  = false,
                        style      = androidx.compose.ui.graphics.drawscope.Stroke(
                            width = stroke,
                            cap   = androidx.compose.ui.graphics.StrokeCap.Round
                        )
                    )
                }
            }
            // 중앙 텍스트
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text       = labelText,
                    fontSize   = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color      = arcColor
                )
                if (doorState != DoorState.CLOSED) {
                    Text(
                        text     = "${(openFraction * 100).toInt()}%",
                        fontSize = 10.sp,
                        color    = Color(0xFF888888)
                    )
                }
            }
        }
    }
}

// ── 공지/이력 스크롤 배너 ──────────────────────────
@Composable
fun NoticeBanner(history: List<FloorRecord>) {
    val infiniteTransition = rememberInfiniteTransition(label = "notice")
    val scroll by infiniteTransition.animateFloat(
        initialValue  = 0f,
        targetValue   = 1f,
        animationSpec = infiniteRepeatable(tween(8000, easing = LinearEasing), RepeatMode.Restart),
        label         = "noticeScroll"
    )

    val text = "선택 층: " + history.joinToString("   ▶   ") { "${it.floor}층 (${it.time})" }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFAA0000))
            .padding(vertical = 6.dp)
            .clip(RectangleShape)
    ) {
        Text(
            text     = "  $text  ",
            fontSize = 12.sp,
            color    = Color(0xFFFFEE88),
            fontWeight = FontWeight.Medium,
            maxLines = 1,
            modifier = Modifier
                .offset(x = ((-scroll) * 400).dp)
                .horizontalScroll(rememberScrollState(), enabled = false)
        )
    }
}

// ── 사용 안 하는 구 컴포저블 (BLE/ViewModel 호환용으로 유지) ──
fun floorColor(floor: Int) = when {
    floor <= 0  -> Color(0xFF37474F)
    floor <= 17 -> Color(0xFF8B0000)
    floor <= 34 -> Color(0xFFAA0000)
    else        -> Color(0xFFCC1100)
}