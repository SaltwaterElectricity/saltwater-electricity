
import time

class TDSStateMachine:
    def __init__(self):
        self.state = 'NORMAL'
        self.start_time = 0
        self.threshold = 50.0
        self.hysteresis = 5.0
        self.confirmation_time = 3600 # 1 hour
        self.recovery_time = 900 # 15 mins
        self.flatline_time = 600 # 10 mins
        self.last_tds = -1.0
        self.flatline_start = 0

    def update(self, tds, current_time):
        prev_tds = self.last_tds
        # Flatline Detection
        if tds == self.last_tds:
            if self.flatline_start == 0:
                self.flatline_start = current_time
            if current_time - self.flatline_start >= self.flatline_time:
                self.state = 'SENSOR_FAULT'
        else:
            self.flatline_start = 0
            self.last_tds = tds

        if tds < 0.1 or tds > 5000.0:
            self.state = 'SENSOR_FAULT'
        else:
            if self.state == 'NORMAL':
                if tds <= self.threshold:
                    self.state = 'LOW_CANDIDATE'
                    self.start_time = current_time
            elif self.state == 'LOW_CANDIDATE':
                if tds > self.threshold + self.hysteresis:
                    self.state = 'NORMAL'
                elif current_time - self.start_time >= self.confirmation_time:
                    self.state = 'CONFIRMED_LOW'
                    print("!!! ALERT DISPATCHED !!!")
            elif self.state == 'CONFIRMED_LOW':
                if tds > self.threshold + self.hysteresis:
                    self.state = 'RECOVERY'
                    self.start_time = current_time
            elif self.state == 'RECOVERY':
                if tds <= self.threshold:
                    self.state = 'LOW_CANDIDATE'
                    self.start_time = current_time
                elif current_time - self.start_time >= self.recovery_time:
                    self.state = 'NORMAL'
            elif self.state == 'SENSOR_FAULT':
                if 0.1 <= tds <= 5000.0 and tds != prev_tds:
                    self.state = 'NORMAL'
        return self.state

sm = TDSStateMachine()
print("Test 2: Flatline Detection and Recovery")
print(f"T=0, TDS=40: {sm.update(40, 0)}")
print(f"T=1, TDS=40: {sm.update(40, 1)}")
print(f"T=601, TDS=40: {sm.update(40, 601)}")
print(f"T=602, TDS=41: {sm.update(41, 602)}")
