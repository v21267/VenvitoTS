import SQLite from 'react-native-sqlite-storage';
import moment from 'moment';

import metricsDefinitions from '../utils/metricsdefinitions';

class DbHelper
{
  m_DB = null;

  openDb()
  {
    if (!this.m_DB)
    {
      this.m_DB = SQLite.openDatabase('VenvitoDB');
      this.initTables();
    }
    return this.m_DB;
  }

  initTables()
  {
    this.openDb();

    this.m_DB.transaction((tx) =>
    {
      this.execSqlWithTx(
        tx,
        "CREATE TABLE IF NOT EXISTS SYSTEM_SETTING " +
        "(SETTING_KEY TEXT PRIMARY KEY, SETTING_VALUE TEXT);");
      this.execSqlWithTx(
        tx,
        "INSERT OR REPLACE INTO SYSTEM_SETTING " +
        "(SETTING_KEY, SETTING_VALUE) " +
        "VALUES ('DB_VERSION', '1');");

      this.execSqlWithTx(
        tx,
        "CREATE TABLE IF NOT EXISTS METRIC_DEFINITION " +
        "(METRIC_CODE TEXT NOT NULL, DESCRIPTION TEXT NOT NULL, METRIC_TYPE TEXT NOT NULL, " +
        " COLOR TEXT NOT NULL, SORT_ORDER INTEGER NOT NULL," +
        " PRIMARY KEY(METRIC_CODE));");
      for (let i = 0; i < metricsDefinitions.length; i++)
      {
        const md = metricsDefinitions[i];
        this.execSqlWithTx(
          tx,
          "INSERT OR REPLACE INTO METRIC_DEFINITION " +
          "(METRIC_CODE, DESCRIPTION, METRIC_TYPE, COLOR, SORT_ORDER) " +
          "VALUES (?, ?, ?, ?, ?);",
          [md.code, md.description, md.type, md.color, (i + 1) * 100]
        );
      }

    this.execSqlWithTx(
      tx,
      "CREATE TABLE IF NOT EXISTS METRIC_DATA " +
      "(DATE TEXT NOT NULL, METRIC_CODE TEXT NOT NULL, METRIC_VALUE REAL NOT NULL, " +
      " PRIMARY KEY(DATE, METRIC_CODE));");

    this.execSqlWithTx(
      tx,
      "CREATE TABLE IF NOT EXISTS CHART_PERIOD " +
      "(START_DATE TEXT NOT NULL, END_DATE TEXT NOT NULL, PERIOD_NAME TEXT NOT NULL, " +
      " PRIMARY KEY(START_DATE));");
    });
  }

  getMetricsData(date, callback)
  {
    this.openDb();

    this.m_DB.transaction((tx) =>
    {
      tx.executeSql(
        "SELECT def.METRIC_CODE, def.DESCRIPTION, def.METRIC_TYPE, def.COLOR, " +
        "       IFNULL(data.METRIC_VALUE, 0) AS METRIC_VALUE " +
        "FROM METRIC_DEFINITION def " + 
        "LEFT OUTER JOIN METRIC_DATA data ON data.METRIC_CODE = def.METRIC_CODE " +
        "                                AND DATE = ?",
        [date],
        (tx, result) =>
        {
          const data = new Array();
          const count = result.rows.length;
          try
          {
            for (let i = 0; i < count; i++)
            {
              let row = result.rows.item(i);
              data.push(
                {
                  code: row.METRIC_CODE, 
                  description: row.DESCRIPTION,
                  type: row.METRIC_TYPE,
                  color: row.COLOR,
                  value: row.METRIC_VALUE
                }
              );
            }
            callback({data: data});
          }
          catch(e)
          {
            callback({error: JSON.stringify(e)});
          }
        },
        (err) =>
        {
          callback({error: err.message});
        }
      );
    });
  }

  updateMetricsData(md)
  {
     this.execSql(
      "INSERT OR REPLACE INTO METRIC_DATA " +
      "(DATE, METRIC_CODE, METRIC_VALUE) " +
      "VALUES (?, ?, ?);",
      [md.date, md.code, md.value]
    );
  }

  prepareChartPeriods(tx, dateRange)
  { 
    this.execSqlWithTx(tx, "DELETE FROM CHART_PERIOD;");

    const totalDays = (dateRange == "7" || dateRange == "30" ? parseInt(dateRange) - 1 : 0);
    const endDate = moment();
    let startDate = moment(endDate).add(-totalDays, "days");
    const monthStart = moment(endDate.format("YYYYMM") + "01", "YYYYMMDD");
    if (dateRange == "M")
    {
      startDate = moment(monthStart).add(-6, "months");
    }
    else if (dateRange == "Q")
    {
      startDate = moment(monthStart).add(-(4 * 3 + monthStart.month() % 3), "months");
    }
    const periodCount =
      (dateRange == "M" ? 7 :
       dateRange == "Q" ? 5 :
                          parseInt(dateRange));

     for (let i = 0; i < periodCount; i++)
    {
      let date = moment(startDate).add(i, "days");
      if (dateRange == "M")
        date = moment(startDate).add(i, "months");
      else if (dateRange == "Q")
        date = moment(startDate).add(i * 3, "months");

      const periodName =
        (dateRange == "7"  ? date.format("dd").substring(0, 2) :
        dateRange == "30" ? date.format("M/D/YY") :
        dateRange == "M"  ? date.format("MMM-YY") :
        dateRange == "Q" ? "Q" + date.format("Q") + "-" + date.format("YY") :
                            date.format("MM/DD/YYYY"));
      const periodStart = date.format("YYYYMMDD");
      let periodEnd = 0;
      if (dateRange == "7" || dateRange == "30")
      {
        periodEnd = periodStart;
      }
      else if (dateRange == "M")
      {
        periodEnd = moment(date).add(1, "months").add(-1, "days").format("YYYYMMDD");
      }
      else if (dateRange == "Q")
      {
        periodEnd = moment(date).add(3, "months").add(-1, "days").format("YYYYMMDD");
      }
      
      this.execSqlWithTx(
        tx, 
        "INSERT OR REPLACE INTO CHART_PERIOD " +
        "(START_DATE, END_DATE, PERIOD_NAME) " +
        "VALUES (?, ?, ?);",
        [periodStart, periodEnd, periodName]
      );
    }
  }

  getMetricsChart(period, callback)
  {
    this.openDb();
    const start = new Date().getTime();
  
    this.m_DB.transaction((tx) =>
    {
      const createTran = new Date().getTime();

      this.prepareChartPeriods(tx, period);

      const preparePeriods = new Date().getTime();

      tx.executeSql(
      
        "SELECT def.METRIC_CODE, cp.PERIOD_NAME, COALESCE(SUM(md.METRIC_VALUE), 0) AS TOTAL_VALUE " +
        "FROM CHART_PERIOD cp " +
        "CROSS JOIN METRIC_DEFINITION def " +
        "LEFT OUTER JOIN METRIC_DATA md ON md.DATE BETWEEN cp.START_DATE and cp.END_DATE " +
        "                              AND md.METRIC_CODE = def.METRIC_CODE " +
        "GROUP BY def.METRIC_CODE, def.SORT_ORDER, cp.PERIOD_NAME " +
        "ORDER BY def.SORT_ORDER, cp.START_DATE", 
        null,
        (tx, result) =>
        {
          const middle = new Date().getTime();;
    
          const data = [];
          const count = result.rows.length;
          try
          {
            let prevCode = "";
            let metricData = null;
            for (let i = 0; i < count; i++)
            {
              let row = result.rows.item(i);
              const code = row.METRIC_CODE;
              if (code != prevCode || i == 0)
              {
                if (i > 0) 
                {
                  data.push(metricData);
                }
                prevCode = code;
                metricData = { code: code, data: [], totalValue: 0 };
              }
              const periodName = row.PERIOD_NAME;
              const value = row.TOTAL_VALUE;
              metricData.totalValue += value;
              metricData.data.push({periodName, value});
            }
            data.push(metricData);

            const end = new Date().getTime();;
            const duration = end - start;

            callback({data, duration, end, middle, start, preparePeriods, createTran});
          }
          catch(e)
          {
            callback({error: e.message});
          }
        },
        (err) =>
        {
          callback({error: err.message});
        });
    });
  }

  async execSql(sql, params, name)
  {
    this.openDb();

    this.m_DB.transaction(async (tx) => 
    {
      await this.execSqlWithTx(tx, sql, params, name);
    });
  }

  async execSqlWithTx(tx, sql, params, name)
  {
    await tx.executeSql(
      sql, params, null,
      (err) => 
      {
        const s = (name == null ? sql + (params != null ? "\n" + JSON.stringify(params) : "") : name);
        console.error("SQL Error:\n" + s + "\n" + JSON.stringify(err));
      });
  }
}

const dbHelper = new DbHelper();
export default dbHelper;
