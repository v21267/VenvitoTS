import { LayoutAnimation, } from 'react-native';
import moment from 'moment';

import dbHelper from '../utils/dbhelper';
import observableStore from '../utils/store';

export default class VenvitoService
{
  static initialDate = new Date();

  static addDays(date, delta)
  {
    return new Date(date.getTime() + delta * (1000 * 60 * 60 * 24));
  }

  static shiftDate(delta)
  {
    const newDate = VenvitoService.addDays(observableStore.currentDate, delta);
    if (newDate > new Date()) return;

    VenvitoService.setCurrentDate(newDate);
  }

  static setCurrentDate(newDate)
  {
    if (LayoutAnimation.Presets.easeInEaseOut.duration != 100)
    {
      LayoutAnimation.Presets.easeInEaseOut.duration = 100;
    }
    LayoutAnimation.easeInEaseOut();

    observableStore.currentDate = newDate;
    VenvitoService.getMetricsData(newDate);
  }

  static dateToString(date)
  {
    const d = moment(date).format("YYYYMMDD");
    return d;
  }

  static getMetricsData(date)
  {
    const d = VenvitoService.dateToString(date);
    dbHelper.getMetricsData(
      d,
      result =>
      {
        if (result.data)
        {
          const data = result.data;
          data.forEach(element => {element.date = date});
          observableStore.maxCountWidth = 0;
          observableStore.data = data;
        }
        else
        {
          console.error("Error reading in getMetricsData(): " + result.error);
        }
      });
  }

  static updateMetricsData(updatedMD)
  {
    const newMD = {...updatedMD};
    newMD.date = VenvitoService.dateToString(newMD.date);
    dbHelper.updateMetricsData(newMD);

    const newData = observableStore.data.map(md =>
    {
      if (md.code === newMD.code)
      {
        return { ...md, value: newMD.value }
      }
      return md;
    });

    observableStore.maxCountWidth = 0;
    observableStore.data = newData;
    observableStore.metricValueUpdateCount++;
  }

  static prepareChartPeriods(period)
  {
    dbHelper.prepareChartPeriods(period);
  }
 
  static getMetricsChart(md, period, callback)
  {
    dbHelper.getMetricsChart(md, period, callback);
  }
}
