// ===== FILE: ELEVATOR_FLOOR_SELECTOR.ino =====
// 커스텀 폰트 적용본: my_font_96.c / my_font_80.c 파일 필요
// zoom 완전 제거 → 선명한 네이티브 렌더링

#include "lcd_bsp.h"
#include "lcd_bl_pwm_bsp.h"
#include "lcd_config.h"
#include <Arduino.h>
#include "driver/i2c.h"
#include "bidi_switch_knob.h"
#include "ESP32_NOW.h"
#include "WiFi.h"
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ===== [커스텀 폰트 선언] =====
// my_font_96.c, my_font_80.c 파일이 같은 폴더에 있어야 함
LV_FONT_DECLARE(lv_font_montserrat_96);
LV_FONT_DECLARE(lv_font_montserrat_192);   // 1자리 숫자용 (1~9)
LV_FONT_DECLARE(lv_font_montserrat_192 );   // 2자리 숫자용 (10~50)

// ===== BUZZER =====
#define BUZZER_PIN 4

// ===== BLE SETTINGS =====
#define SERVICE_UUID       "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define FLOOR_CHAR_UUID    "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define STATUS_CHAR_UUID   "beb5483e-36e1-4688-b7f5-ea07361b26a9"
#define COMMAND_CHAR_UUID  "beb5483e-36e1-4688-b7f5-ea07361b26aa"

BLEServer          *pServer              = NULL;
BLECharacteristic  *pFloorCharacteristic = NULL;
BLECharacteristic  *pStatusCharacteristic= NULL;
BLECharacteristic  *pCommandCharacteristic=NULL;
bool deviceConnected    = false;
bool oldDeviceConnected = false;

// ===== ESPNOW =====
#define ESPNOW_WIFI_CHANNEL 6

class ESP_NOW_Broadcast_Peer : public ESP_NOW_Peer {
public:
  ESP_NOW_Broadcast_Peer(uint8_t channel, wifi_interface_t iface, const uint8_t *lmk)
    : ESP_NOW_Peer(ESP_NOW.BROADCAST_ADDR, channel, iface, lmk) {}
  ~ESP_NOW_Broadcast_Peer() { remove(); }

  bool begin() {
    if (!ESP_NOW.begin() || !add()) {
      Serial.println("Failed to initialize ESP-NOW");
      return false;
    }
    return true;
  }
  bool send_message(const uint8_t *data, size_t len) {
    if (!send(data, len)) {
      Serial.println("Failed to broadcast");
      return false;
    }
    return true;
  }
};

ESP_NOW_Broadcast_Peer broadcast_peer(ESPNOW_WIFI_CHANNEL, WIFI_IF_STA, nullptr);

typedef struct struct_message {
  char    command[20];
  uint8_t selected_floor;
  uint8_t current_floor;
  bool    floor_confirmed;
} struct_message;

struct_message espnowData;

// ===== I2C =====
#define I2C_SDA_PIN        11
#define I2C_SCL_PIN        12
#define I2C_MASTER_NUM     I2C_NUM_0
#define I2C_MASTER_FREQ_HZ 100000
#define HAPTIC_ADDR        0x5A
#define TOUCH_ADDR         0x15

// ===== ENCODER =====
#define EXAMPLE_ENCODER_ECA_PIN  8
#define EXAMPLE_ENCODER_ECB_PIN  7

// ===== HAPTIC EFFECTS =====
#define HAPTIC_TICK    6
#define HAPTIC_CLICK   6
#define HAPTIC_CONFIRM 12
#define HAPTIC_CANCEL  15
#define HAPTIC_ARRIVAL 14

// ===== ELEVATOR =====
#define MIN_FLOOR    1
#define MAX_FLOOR    50
#define TOTAL_FLOORS MAX_FLOOR

int  selected_floor = 1;
int  current_floor  = 1;
bool floor_confirmed = false;
unsigned long last_interaction_time = 0;
#define IDLE_TIMEOUT_MS 30000

// ===== GLOBALS =====
static knob_handle_t s_knob = 0;
bool haptic_available = false;
bool i2c_initialized  = false;

// ===== TOUCH =====
bool touch_pressed = false;
unsigned long touch_press_start = 0;
#define LONG_PRESS_MS 800

// ===== SCREEN =====
#define SCREEN_WIDTH  360
#define SCREEN_HEIGHT 360
#define CENTER_X      180
#define CENTER_Y      180

// ===== DIAL =====
#define DIAL_RADIUS     160
#define MARKER_RADIUS   160
#define NUMBER_RADIUS   160
#define MAJOR_DOT_SIZE  15
#define MEDIUM_DOT_SIZE 10
#define MARKER_DOT_SIZE 30

// 다이얼 점 색상 (검정 배경에 보이지 않게 = 점 숨김 효과)
// 보이게 하려면 lv_color_make(80,80,80) 등으로 변경
#define MAJOR_DOT_COLOR  lv_color_make(40, 40, 40)
#define MEDIUM_DOT_COLOR lv_color_make(25, 25, 25)
#define CONFIRMED_COLOR  lv_color_make(255, 255, 255)

// 번호 표시 설정
#define SHOW_ALL_NUMBERS false
#define NUMBER_FONT      &lv_font_montserrat_32
#define NUMBER_COLOR     lv_color_make(255, 255, 255)
#define NUMBER_OFFSET_X  -16
#define NUMBER_OFFSET_Y  -16

// 상태/현재층 폰트
#define STATUS_FONT  &lv_font_montserrat_20
#define STATUS_COLOR lv_color_make(200, 200, 200)

// ===== UI ELEMENTS =====
lv_obj_t *dial_marker;
lv_obj_t *floor_label;
lv_obj_t *status_label;
lv_obj_t *current_floor_label;

// ===== 층 번호 문자열 (버그 수정: 쉼표 추가) =====
const char* floor_display[] = {
  "1","2","3","4","5","6","7","8","9","10",
  "11","12","13","14","15","16","17","18","19","20",
  "21","22","23","24","25","26","27","28","29","30",
  "31","32","33","34","35","36","37","38","39","40",
  "41","42","43","44","45","46","47","48","49","50"
};

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

// ===== FUNCTION DECLARATIONS =====
void create_elevator_ui();
void update_floor_display();
void update_dial_marker_position();
void confirm_floor_selection();
void cancel_floor_selection();
void check_idle_timeout();
bool init_i2c();
bool init_haptic();
void play_haptic(uint8_t effect);
void play_sound(int freq, int duration);
bool init_touch();
bool getTouch(uint16_t *x, uint16_t *y);
void sendESPNOWMessage(const char* cmd, uint8_t floor);
void sendBLEFloorUpdate(uint8_t floor, const char* status);
void knob_left_handler(void *arg, void *data);
void knob_right_handler(void *arg, void *data);

// ===== HELPER: 층별 테마 색상 =====
lv_color_t get_floor_color(int floor) {
  if (floor <= 20)      return lv_color_make(50, 255, 80);   // 초록
  else if (floor <= 35) return lv_color_make(0, 200, 255);   // 파랑
  else                  return lv_color_make(255, 60, 200);   // 마젠타
}

// ===== [핵심] 자릿수별 커스텀 폰트 선택 =====
// zoom 없이 폰트 자체 크기로 렌더링 → 완벽한 선명도
const lv_font_t* get_floor_font(int floor) {
  if (floor < 10) return &lv_font_montserrat_192;  // 1자리: 96px
  else            return &lv_font_montserrat_192;  // 2자리: 80px
}

// ===== BLE CALLBACKS =====
class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("BLE Connected!");
    sendBLEFloorUpdate(selected_floor, "CONNECTED");
  }
  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("BLE Disconnected!");
  }
};

class CommandCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) {
    String value = pCharacteristic->getValue().c_str();
    if (value.length() == 0) return;

    Serial.print("BLE CMD: "); Serial.println(value);

    if (value == "GET_STATUS") {
      sendBLEFloorUpdate(selected_floor, "STATUS");
    } else if (value == "GET_CURRENT") {
      sendBLEFloorUpdate(current_floor, "CURRENT");
    } else if (value.startsWith("GOTO_")) {
      int floor = value.substring(5).toInt();
      if (floor >= MIN_FLOOR && floor <= MAX_FLOOR) {
        selected_floor = floor;
        update_floor_display();
        update_dial_marker_position();
        sendBLEFloorUpdate(selected_floor, "SELECTED");
      }
    } else if (value == "CONFIRM") {
      confirm_floor_selection();
    } else if (value == "CANCEL") {
      cancel_floor_selection();
    }
  }
};

// ===== BLE INIT =====
void initBLE() {
  BLEDevice::init("Elevator_Controller");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  BLEService *pService = pServer->createService(SERVICE_UUID);

  pFloorCharacteristic = pService->createCharacteristic(
    FLOOR_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  pFloorCharacteristic->addDescriptor(new BLE2902());

  pStatusCharacteristic = pService->createCharacteristic(
    STATUS_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  pStatusCharacteristic->addDescriptor(new BLE2902());

  pCommandCharacteristic = pService->createCharacteristic(
    COMMAND_CHAR_UUID, BLECharacteristic::PROPERTY_WRITE);
  pCommandCharacteristic->setCallbacks(new CommandCallbacks());

  pService->start();
  BLEAdvertising *pAdv = BLEDevice::getAdvertising();
  pAdv->addServiceUUID(SERVICE_UUID);
  pAdv->setScanResponse(true);
  pAdv->setMinPreferred(0x06);
  pAdv->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  Serial.println("BLE ready.");
}

void sendBLEFloorUpdate(uint8_t floor, const char* status) {
  if (!deviceConnected) return;
  char buf[50];
  sprintf(buf, "%d", floor);
  pFloorCharacteristic->setValue(buf);
  pFloorCharacteristic->notify();
  sprintf(buf, "%s:%d", status, floor);
  pStatusCharacteristic->setValue(buf);
  pStatusCharacteristic->notify();
}

void sendESPNOWMessage(const char* cmd, uint8_t floor) {
  strcpy(espnowData.command, cmd);
  espnowData.selected_floor  = floor;
  espnowData.current_floor   = current_floor;
  espnowData.floor_confirmed = floor_confirmed;
  broadcast_peer.send_message((uint8_t *)&espnowData, sizeof(espnowData));
}

// ===== I2C =====
bool init_i2c() {
  if (i2c_initialized) return true;
  i2c_config_t conf = {
    .mode           = I2C_MODE_MASTER,
    .sda_io_num     = I2C_SDA_PIN,
    .scl_io_num     = I2C_SCL_PIN,
    .sda_pullup_en  = GPIO_PULLUP_ENABLE,
    .scl_pullup_en  = GPIO_PULLUP_ENABLE,
    .master         = { .clk_speed = I2C_MASTER_FREQ_HZ },
    .clk_flags      = 0,
  };
  if (i2c_param_config(I2C_MASTER_NUM, &conf)          != ESP_OK) return false;
  if (i2c_driver_install(I2C_MASTER_NUM, I2C_MODE_MASTER, 0, 0, 0) != ESP_OK) return false;
  delay(100);
  i2c_initialized = true;
  return true;
}

// ===== HAPTIC (람다로 간결화) =====
static void i2c_write_reg(uint8_t addr, uint8_t reg, uint8_t val) {
  uint8_t data[2] = { reg, val };
  i2c_cmd_handle_t cmd = i2c_cmd_link_create();
  i2c_master_start(cmd);
  i2c_master_write_byte(cmd, (addr << 1) | I2C_MASTER_WRITE, true);
  i2c_master_write(cmd, data, 2, true);
  i2c_master_stop(cmd);
  i2c_master_cmd_begin(I2C_MASTER_NUM, cmd, pdMS_TO_TICKS(100));
  i2c_cmd_link_delete(cmd);
}

bool init_haptic() {
  if (!i2c_initialized && !init_i2c()) return false;
  // 디바이스 존재 확인
  i2c_cmd_handle_t cmd = i2c_cmd_link_create();
  i2c_master_start(cmd);
  i2c_master_write_byte(cmd, (HAPTIC_ADDR << 1) | I2C_MASTER_WRITE, true);
  i2c_master_stop(cmd);
  esp_err_t err = i2c_master_cmd_begin(I2C_MASTER_NUM, cmd, pdMS_TO_TICKS(100));
  i2c_cmd_link_delete(cmd);
  if (err != ESP_OK) { Serial.println("Haptic not found"); return false; }
  delay(10);
  i2c_write_reg(HAPTIC_ADDR, 0x01, 0x00);  // Mode: Internal Trigger
  delay(10);
  i2c_write_reg(HAPTIC_ADDR, 0x03, 0x01);  // Library: LRA
  delay(10);
  return true;
}

void play_haptic(uint8_t effect) {
  if (!haptic_available) return;
  i2c_write_reg(HAPTIC_ADDR, 0x04, effect);
  i2c_write_reg(HAPTIC_ADDR, 0x05, 0x00);
  i2c_write_reg(HAPTIC_ADDR, 0x0C, 0x01);
  delay(10);
}

void play_sound(int freq, int duration) {
  tone(BUZZER_PIN, freq, duration);
}

// ===== TOUCH =====
bool init_touch() {
  if (!i2c_initialized && !init_i2c()) return false;
  uint8_t data = 0x00;
  i2c_cmd_handle_t cmd = i2c_cmd_link_create();
  i2c_master_start(cmd);
  i2c_master_write_byte(cmd, (TOUCH_ADDR << 1) | I2C_MASTER_WRITE, true);
  i2c_master_write_byte(cmd, 0x00, true);
  i2c_master_write_byte(cmd, data, true);
  i2c_master_stop(cmd);
  esp_err_t err = i2c_master_cmd_begin(I2C_MASTER_NUM, cmd, pdMS_TO_TICKS(100));
  i2c_cmd_link_delete(cmd);
  return (err == ESP_OK);
}

bool getTouch(uint16_t *x, uint16_t *y) {
  uint8_t data[7] = {0};
  i2c_cmd_handle_t cmd = i2c_cmd_link_create();
  i2c_master_start(cmd);
  i2c_master_write_byte(cmd, (TOUCH_ADDR << 1) | I2C_MASTER_WRITE, true);
  i2c_master_write_byte(cmd, 0x00, true);
  i2c_master_start(cmd);
  i2c_master_write_byte(cmd, (TOUCH_ADDR << 1) | I2C_MASTER_READ, true);
  i2c_master_read(cmd, data, 7, I2C_MASTER_LAST_NACK);
  i2c_master_stop(cmd);
  esp_err_t err = i2c_master_cmd_begin(I2C_MASTER_NUM, cmd, pdMS_TO_TICKS(50));
  i2c_cmd_link_delete(cmd);
  if (err != ESP_OK || !data[2]) return false;
  *x = ((uint16_t)(data[3] & 0x0f) << 8) | data[4];
  *y = ((uint16_t)(data[5] & 0x0f) << 8) | data[6];
  return true;
}

// ===== KNOB HANDLERS =====
void knob_left_handler(void *arg, void *data) {
  if (--selected_floor < MIN_FLOOR) selected_floor = MAX_FLOOR;
  last_interaction_time = millis();
  if (haptic_available) play_haptic(HAPTIC_TICK);
  play_sound(2000, 30);
  update_floor_display();
  update_dial_marker_position();
  sendESPNOWMessage("SELECT_FLOOR", selected_floor);
  sendBLEFloorUpdate(selected_floor, "SELECTED");
}

void knob_right_handler(void *arg, void *data) {
  if (++selected_floor > MAX_FLOOR) selected_floor = MIN_FLOOR;
  last_interaction_time = millis();
  if (haptic_available) play_haptic(HAPTIC_TICK);
  play_sound(2000, 30);
  update_floor_display();
  update_dial_marker_position();
  sendESPNOWMessage("SELECT_FLOOR", selected_floor);
  sendBLEFloorUpdate(selected_floor, "SELECTED");
}

// ===== CONFIRM / CANCEL =====
void confirm_floor_selection() {
  floor_confirmed = true;
  if (haptic_available) play_haptic(HAPTIC_CONFIRM);
  play_sound(1500, 100);

  lv_obj_set_style_bg_color(dial_marker, CONFIRMED_COLOR, 0);
  lv_obj_set_style_text_color(floor_label, CONFIRMED_COLOR, 0);

  char buf[40];
  sprintf(buf, "Going to %dF", selected_floor);
  lv_label_set_text(status_label, buf);
  lv_obj_set_style_text_color(status_label, CONFIRMED_COLOR, 0);

  sendESPNOWMessage("CONFIRM", selected_floor);
  sendBLEFloorUpdate(selected_floor, "CONFIRMED");
  delay(2000);

  current_floor = selected_floor;
  sprintf(buf, "At: %dF", current_floor);
  lv_label_set_text(current_floor_label, buf);

  if (haptic_available) play_haptic(HAPTIC_ARRIVAL);
  play_sound(800, 300);

  lv_label_set_text(status_label, "Arrived!");
  sendBLEFloorUpdate(current_floor, "ARRIVED");
  delay(3000);

  floor_confirmed = false;
  lv_color_t tc = get_floor_color(selected_floor);
  lv_obj_set_style_bg_color(dial_marker, tc, 0);
  lv_obj_set_style_text_color(floor_label, tc, 0);
  lv_label_set_text(status_label, "Select Floor");
  lv_obj_set_style_text_color(status_label, STATUS_COLOR, 0);
}

void cancel_floor_selection() {
  floor_confirmed = false;
  if (haptic_available) play_haptic(HAPTIC_CANCEL);
  play_sound(500, 100);

  lv_color_t tc = get_floor_color(selected_floor);
  lv_obj_set_style_bg_color(dial_marker, tc, 0);
  lv_obj_set_style_text_color(floor_label, tc, 0);

  lv_label_set_text(status_label, "Cancelled");
  lv_obj_set_style_text_color(status_label, lv_color_make(0, 160, 160), 0);
  sendESPNOWMessage("CANCEL", 0);
  sendBLEFloorUpdate(selected_floor, "CANCELLED");
  delay(1500);
  lv_label_set_text(status_label, "Select Floor");
  lv_obj_set_style_text_color(status_label, STATUS_COLOR, 0);
}

// ===== UI CREATE =====
void create_elevator_ui() {
  lv_obj_set_style_bg_color(lv_scr_act(), lv_color_make(0, 0, 0), 0);

  lv_color_t tc = get_floor_color(selected_floor);

  // ----- 다이얼 점 생성 -----
  for (int i = 0; i < TOTAL_FLOORS; i++) {
    float angle_rad = ((i * 18.0f) - 90.0f) * (float)M_PI / 180.0f;
    int cx = CENTER_X + (int)(DIAL_RADIUS * cosf(angle_rad));
    int cy = CENTER_Y + (int)(DIAL_RADIUS * sinf(angle_rad));
    bool isMajor = ((i + 1) % 5 == 0);
    int  sz      = isMajor ? MAJOR_DOT_SIZE : MEDIUM_DOT_SIZE;

    lv_obj_t *dot = lv_obj_create(lv_scr_act());
    lv_obj_set_size(dot, sz, sz);
    lv_obj_set_style_radius(dot, sz / 2, 0);
    lv_obj_set_style_bg_color(dot, isMajor ? MAJOR_DOT_COLOR : MEDIUM_DOT_COLOR, 0);
    lv_obj_set_style_border_width(dot, 0, 0);
    lv_obj_set_pos(dot, cx - sz / 2, cy - sz / 2);

    if (SHOW_ALL_NUMBERS) {
      int nx = CENTER_X + (int)(NUMBER_RADIUS * cosf(angle_rad));
      int ny = CENTER_Y + (int)(NUMBER_RADIUS * sinf(angle_rad));
      lv_obj_t *lbl = lv_label_create(lv_scr_act());
      lv_label_set_text(lbl, floor_display[i]);
      lv_obj_set_style_text_color(lbl, NUMBER_COLOR, 0);
      lv_obj_set_style_text_font(lbl, NUMBER_FONT, 0);
      lv_obj_set_pos(lbl, nx + NUMBER_OFFSET_X, ny + NUMBER_OFFSET_Y);
    }
  }

  // ----- 마커 -----
  dial_marker = lv_obj_create(lv_scr_act());
  lv_obj_set_size(dial_marker, MARKER_DOT_SIZE, MARKER_DOT_SIZE);
  lv_obj_set_style_radius(dial_marker, MARKER_DOT_SIZE / 2, 0);
  lv_obj_set_style_bg_color(dial_marker, tc, 0);
  lv_obj_set_style_border_width(dial_marker, 0, 0);
  update_dial_marker_position();

  // ----- 층 숫자 레이블 [커스텀 폰트 / zoom 없음] -----
  floor_label = lv_label_create(lv_scr_act());
  lv_label_set_text(floor_label, "1");
  lv_obj_set_style_text_font(floor_label, get_floor_font(selected_floor), 0);
  lv_obj_set_style_text_color(floor_label, tc, 0);
  lv_obj_set_style_text_align(floor_label, LV_TEXT_ALIGN_CENTER, 0);
  // zoom 명시적으로 1:1 고정 (transform_zoom 기본값 = 256)
  lv_obj_set_style_transform_zoom(floor_label, 256, 0);
  lv_obj_align(floor_label, LV_ALIGN_CENTER, 0, 0);

  // ----- 상태 레이블 -----
  status_label = lv_label_create(lv_scr_act());
  lv_label_set_text(status_label, "Select Floor");
  lv_obj_set_style_text_font(status_label, STATUS_FONT, 0);
  lv_obj_set_style_text_color(status_label, STATUS_COLOR, 0);
  lv_obj_set_style_bg_opa(status_label, LV_OPA_0, 0);
  lv_obj_align(status_label, LV_ALIGN_CENTER, 0, -110);

  // ----- 현재층 레이블 -----
  current_floor_label = lv_label_create(lv_scr_act());
  lv_label_set_text(current_floor_label, "At: 1F");
  lv_obj_set_style_text_font(current_floor_label, &lv_font_montserrat_14, 0);
  lv_obj_set_style_text_color(current_floor_label, lv_color_make(255, 255, 0), 0);
  lv_obj_set_style_bg_opa(current_floor_label, LV_OPA_0, 0);
  lv_obj_align(current_floor_label, LV_ALIGN_CENTER, 0, 110);
}

// ===== UPDATE DISPLAY =====
void update_floor_display() {
  char buf[6];
  sprintf(buf, "%d", selected_floor);
  lv_label_set_text(floor_label, buf);

  // 커스텀 폰트 교체 (자릿수에 따라 자동 전환)
  lv_obj_set_style_text_font(floor_label, get_floor_font(selected_floor), 0);
  lv_obj_set_style_transform_zoom(floor_label, 256, 0);  // 1:1 유지
  lv_obj_set_style_text_color(floor_label, get_floor_color(selected_floor), 0);
  lv_obj_align(floor_label, LV_ALIGN_CENTER, 0, 0);
}

void update_dial_marker_position() {
  float angle_rad = (((selected_floor - 1) * 18.0f) - 90.0f) * (float)M_PI / 180.0f;
  int mx = CENTER_X + (int)(MARKER_RADIUS * cosf(angle_rad));
  int my = CENTER_Y + (int)(MARKER_RADIUS * sinf(angle_rad));
  lv_obj_set_pos(dial_marker, mx - MARKER_DOT_SIZE / 2, my - MARKER_DOT_SIZE / 2);
  lv_obj_set_style_bg_color(dial_marker, get_floor_color(selected_floor), 0);
}

void check_idle_timeout() {
  if (millis() - last_interaction_time > IDLE_TIMEOUT_MS) {
    if (!floor_confirmed) {
      Serial.println("=== IDLE TIMEOUT ===");
      cancel_floor_selection();
      last_interaction_time = millis();
    }
  }
}

// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== ELEVATOR (CUSTOM FONT) ===");

  pinMode(BUZZER_PIN, OUTPUT);

  WiFi.mode(WIFI_STA);
  WiFi.setChannel(ESPNOW_WIFI_CHANNEL);
  while (!WiFi.STA.started()) delay(100);
  Serial.print("MAC: "); Serial.println(WiFi.macAddress());

  if (!broadcast_peer.begin()) {
    Serial.println("ESP-NOW Failed"); while (1) delay(100);
  }

  if (!init_i2c())   Serial.println("I2C Failed");
  haptic_available = init_haptic();
  if (haptic_available) play_haptic(HAPTIC_TICK);
  init_touch();

  lcd_bl_pwm_bsp_init(LCD_PWM_MODE_200);
  lcd_lvgl_Init();
  create_elevator_ui();

  knob_config_t cfg = {
    .gpio_encoder_a = EXAMPLE_ENCODER_ECA_PIN,
    .gpio_encoder_b = EXAMPLE_ENCODER_ECB_PIN,
  };
  s_knob = iot_knob_create(&cfg);
  if (!s_knob) while (1) delay(100);
  iot_knob_register_cb(s_knob, KNOB_LEFT,  knob_left_handler,  NULL);
  iot_knob_register_cb(s_knob, KNOB_RIGHT, knob_right_handler, NULL);

  initBLE();

  Serial.println("=== READY ===");
  play_sound(1000, 200);
  last_interaction_time = millis();
}

// ===== LOOP =====
void loop() {
  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    oldDeviceConnected = deviceConnected;
  }
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }

  check_idle_timeout();

  uint16_t tx, ty;
  if (getTouch(&tx, &ty)) {
    if (!touch_pressed) {
      touch_pressed      = true;
      touch_press_start  = millis();
    }
    if (millis() - touch_press_start > LONG_PRESS_MS && !floor_confirmed) {
      confirm_floor_selection();
      touch_pressed = false;
    }
  } else {
    if (touch_pressed) {
      if (millis() - touch_press_start < LONG_PRESS_MS && !floor_confirmed)
        cancel_floor_selection();
      touch_pressed = false;
    }
  }
  delay(10);
}
