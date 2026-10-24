
import math

def calculate_tds(voltage, temp, factor=0.5):
    temp_comp = 1.0 + 0.02 * (temp - 25.0)
    comp_volt = voltage / temp_comp
    tds = (133.42 * pow(comp_volt, 3) - 255.86 * pow(comp_volt, 2) + 857.39 * comp_volt) * factor
    return max(0, min(5000, tds))

def test_tds_conversion():
    print("--- Testing TDS Conversion ---")
    # Test Case 1: Standard 25C, 1.0V
    # V_comp = 1.0 / 1.0 = 1.0
    # TDS = (133.42*1 - 255.86*1 + 857.39*1) * 0.5 = (734.95) * 0.5 = 367.475
    res = calculate_tds(1.0, 25.0)
    print(f"1.0V @ 25C: {res:.3f} ppm (Expected: 367.475)")
    
    # Test Case 2: Temp Compensation (Higher temp should lower V_comp, lowering TDS)
    # 30C -> temp_comp = 1 + 0.02*5 = 1.1
    # V_comp = 1.0 / 1.1 = 0.909
    # TDS(0.909) = (133.42*0.751 - 255.86*0.826 + 857.39*0.909) * 0.5
    # = (100.2 - 211.4 + 779.4) * 0.5 = 668.2 * 0.5 = 334.1
    res_hot = calculate_tds(1.0, 30.0)
    print(f"1.0V @ 30C: {res_hot:.3f} ppm (Expected: ~334)")
    
    # Test Case 3: Invalid/Zero
    print(f"0.0V @ 25C: {calculate_tds(0.0, 25.0):.3f} ppm (Expected: 0.0)")

def test_voltage_scaling():
    print("\n--- Testing Voltage Scaling ---")
    # ESP32 12-bit ADC: 0-4095 -> 0-3.3V
    def adc_to_volt(adc):
        return adc * (3.3 / 4095.0)
    
    print(f"ADC 2048: {adc_to_volt(2048):.3f} V (Expected: ~1.65)")
    print(f"ADC 4095: {adc_to_volt(4095):.3f} V (Expected: 3.30)")

if __name__ == '__main__':
    test_tds_conversion()
    test_voltage_scaling()
