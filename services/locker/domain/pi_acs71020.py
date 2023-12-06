"""Library for the ACS71020 AC Power Monitoring IC from Allegro microsystems.
Supports the Raspberry Pi using the I2C bus.
"""
import Adafruit_GPIO.I2C as I2C


class ACS71020:
    """Class containing the ACS71020 functionality."""

    IGAIN_1 = 0  # 1x gain
    IGAIN_2 = 1  # 2x gain
    IGAIN_3 = 2  # 3x gain
    IGAIN_3_5 = 3  # 3.5x gain
    IGAIN_4 = 4  # 4x gain
    IGAIN_4_5 = 5  # 4.5x gain
    IGAIN_5_5 = 6  # 5.5x gain
    IGAIN_8 = 7  # 8x gain

    __ACCESS_CODE = 0x4F70656E  # customer access code
    __REGISTER_LEN = 4  # number of bytes returned by the device

    __ADDRESS = 0x60  # default i2c address

    __VIN_MAX = 611  # full scale voltage in V (determined by the resistor divider network)
    __IPR_MAX = 90  # full scale current in A (determined by the selected ic)
    __MAX_POW = __VIN_MAX * __IPR_MAX  # full scale power in W
    __MAX_RES = 32768  # voltage and current resolution
    __MAX_RES_IMAG = 65536

    # EEPROM's shadow registers
    __REG_CONF_0 = 0x1B
    __REG_CONF_1 = 0x1C
    __REG_CONF_2 = 0x1D
    __REG_CONF_3 = 0x1E
    __REG_CONF_4 = 0x1F
    
    # Volatile memory registers
    __REG_V_I = 0x20
    __REG_P_ACT = 0x21
    __REG_P_APP = 0x22
    __REG_P_IMAG = 0x23
    __REG_P_FACTOR = 0x24
    __REG_NUM_POINTS = 0x25
    __REG_V_I_AVERAGED1 = 0x26
    __REG_V_I_AVERAGED2 = 0x27
    __REG_P_ACT_AVERAGED1 = 0x28
    __REG_P_ACT_AVERAGED2 = 0x29
    __REG_V_INST = 0x2A
    __REG_I_INST = 0x2B
    __REG_P_INST = 0x2C
    __REG_FAULTS = 0x2D
    __REG_ACCESS_CODE = 0x2F
    __REG_CUSTOMER = 0x30
    
    # Registers fields masks
    __QVO_MSK = 0x000001FF
    __SNS_MSK = 0x0000FE00
    __CRS_MSK = 0x001C0000
    __IAVG_MSK = 0x00200000
    __ECC_MSK = 0xFC000000

    def __init__(self, address=__ADDRESS, vin_max=__VIN_MAX, i_max=__IPR_MAX):
        """
        Construct the class.
        Arguments:
            address: the I2C address of the ACS71020, defaults to 0x60
            vin_max: full scale voltage in V (determined by the resistor divider network)
            i_max: full scale current in A (determined by the selected ic)
        """
        self.__VIN_MAX = vin_max
        self.__IPR_MAX = i_max
        self.__MAX_POW = vin_max * i_max
        self._i2c = I2C.get_i2c_device(address=address)

    def configure(self):
        """Configure and calibrate the ACS71020."""
        
        # Enter Customer mode
        if not self.__read_register(self.__REG_CUSTOMER)[0]:
            self.__write_register(self.__REG_ACCESS_CODE, self.__ACCESS_CODE)
            
        # Configure current offset, gain and average
        qvo_fine = 12
        sns_fine = 0
        crs_sns = self.IGAIN_1
        iavgselen = 1
        self.__write_register(self.__REG_CONF_0, (qvo_fine & self.__QVO_MSK) |
                              ((sns_fine << 9) & self.__SNS_MSK) |
                              ((crs_sns << 18) & self.__CRS_MSK) |
                              ((iavgselen << 21) & self.__IAVG_MSK))
        # Configure number of sample for average
        rms_avg_1 = 64
        rms_avg_2 = 512
        n = 511
        self.__write_register(self.__REG_CONF_1, rms_avg_1 |
                              (rms_avg_2 << 8) |
                              (n << 17))

    def voltage(self):
        """Return RMS voltage in V."""
        register = self.__read_register(self.__REG_V_I)
        value = self.__from_reg(register, bit_start=0, bit_end=14)
        return self.__VIN_MAX * self.__to_integer(value, bits=15, fractionals=15, signed=False)

    def current(self):
        """Return RMS current in A."""
        register = self.__read_register(self.__REG_V_I_AVERAGED1)
        value = self.__from_reg(register, bit_start=16, bit_end=30)
        return self.__IPR_MAX * self.__to_integer(value, bits=15, fractionals=14, signed=True)

    def power_active(self):
        """Return active power consumption in W."""
        register = self.__read_register(self.__REG_P_ACT_AVERAGED1)
        value = self.__from_reg(register, bit_start=0, bit_end=16)
        return self.__MAX_POW * self.__to_integer(value, bits=17, fractionals=15, signed=True)
    
    def power_apparent(self):
        """Return apparent power consumption in VA."""
        register = self.__read_register(self.__REG_P_APP)
        value = self.__from_reg(register, bit_start=0, bit_end=15)
        return self.__MAX_POW * self.__to_integer(value, bits=16, fractionals=15, signed=False)

    def power_imag(self):
        """Return reactive power consumption in VAR."""
        register = self.__read_register(self.__REG_P_ACT)
        value = self.__from_reg(register, bit_start=0, bit_end=15)
        return self.__MAX_POW * self.__to_integer(value, bits=16, fractionals=15, signed=False)

    def __write_register(self, register, register_value):
        register_bytes = self.__to_bytes(register_value)
        self._i2c.writeList(register, register_bytes)

    def __read_register(self, register):
        register_value = self._i2c.readList(register, self.__REGISTER_LEN)
        return register_value

    def __from_reg(self, register, bit_start, bit_end):
        value = register[0] | register[1] << 8 | register[2] << 16 | register[3] << 24
        value_msk = (0xFFFFFFFF >> 32 - bit_end) & (0xFFFFFFFF << bit_start)
        return (value & value_msk) >> bit_start

    def __to_bytes(self, register_value):
        #register_value = I2C.reverseByteOrder(register_value)
        return [(register_value) & 0xFF, (register_value >> 8) & 0xFF,
                (register_value >> 16) & 0xFF, (register_value >> 24) & 0xFF]

    def __to_integer(self, value, bits, fractionals, signed=False):
        lsb = 1 / (2 ** fractionals)
        sign_msk = 1 << (bits - 1)
        if signed:
            value_msk = 0xFFFFFFFF >> (32 - bits + 1)
            if value & sign_msk:
                result = -1 * ((~value & value_msk) + 1) * lsb
            else:
                result = (value & value_msk) * lsb
        else:
            value_msk = 0xFFFFFFFF >> (32 - bits)
            result = (value & value_msk) * lsb
        return result
