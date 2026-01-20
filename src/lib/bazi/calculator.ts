import { Solar, Lunar } from 'lunar-typescript'

export type BaziResult = {
  solar: string
  lunar: string
  ganZhi: {
    year: string
    month: string
    day: string
    time: string
  }
  wuxing: {
    year: string
    month: string
    day: string
    time: string
  }
  dayMaster: {
    gan: string
    zhi: string
    wuxing: string
  }
}

export function calculateBazi(dateStr: string, timeStr?: string): BaziResult {
  // 解析日期 yyyy-MM-dd
  const [y, m, d] = dateStr.split('-').map(Number)
  
  // 解析时间 HH:mm
  let hour = 12 // 默认中午12点
  let minute = 0
  if (timeStr) {
    const [h, min] = timeStr.split(':').map(Number)
    hour = h
    minute = min
  }

  const solar = Solar.fromYmdHms(y, m, d, hour, minute, 0)
  const lunar = solar.getLunar()
  const baZi = lunar.getEightChar()

  return {
    solar: solar.toString(),
    lunar: lunar.toString(),
    ganZhi: {
      year: baZi.getYear(),
      month: baZi.getMonth(),
      day: baZi.getDay(),
      time: baZi.getTime(),
    },
    wuxing: {
      year: baZi.getYearWuXing(),
      month: baZi.getMonthWuXing(),
      day: baZi.getDayWuXing(),
      time: baZi.getTimeWuXing(),
    },
    dayMaster: {
      gan: baZi.getDayGan(),
      zhi: baZi.getDayZhi(),
      wuxing: baZi.getDayWuXing(), // 纳音或正五行，lunar-typescript的getWuXing通常是正五行
    }
  }
}
