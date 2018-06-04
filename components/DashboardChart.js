import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import numeral from 'numeral';
import {observer} from 'mobx-react/native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel } from "victory-native";

import VenvitoService from '../utils/venvitoservice';
import observableStore from '../utils/store';

const ios = (Platform.OS == 'ios');

@observer
export default class DashboardChart extends Component 
{
  unmounted = false;

  constructor(props)
  {
    super(props);
    this.state = { data: null, totalValue: 0, maxValue: 0 };
  }

  componentDidMount()
  {
    this.getChartData();
  }

  componentWillUpdate()
  {
  }

  componentWillReceiveProps(oldProps, newProps)
  {
    this.getChartData();
  }

  componentWillUnmount()
  {
    this.unmounted = true;
  }

  period()
  {
    return observableStore.chartPeriod;
  }

  getChartData()
  {
    if (this.period() == "")
    {
      this.setState(previousState => 
        { 
          return { data: null, totalValue: 0, maxValue: 0 };
        });
    }
    else
    {
      VenvitoService.getMetricsChart(
        this.props.metricsDef, this.props.period,
        result => 
        {
          if (result.data)
          {
            if (!this.unmounted)
            {
              this.setState(previousState => 
                { 
                  return { ...result };
                });
            }
          }
          else
          {
            console.error("Error in getMetricsChart: " + result.err);
          }
        }
      );
    }
  }
 
  formatYAxisValue(md, value)
  {
    const suffix = ["", "k", "M", "G", "T", "P", "E"];
    let index = 0;
    let dvalue = value;
    while ((value /= 1000) >= 1 && ++index) dvalue /= 1000;
    let result =
      (md.type == "AMOUNT" ? "$" : "") +
      Math.round(dvalue).toString() + suffix[index];
    return result;
  }

  renderChart()
  {
    const md = this.props.metricsDef;
    const period = this.period();
    let tickValues = null;
    
    if (this.state.data && this.state.totalValue > 0)
    {
      const len = this.state.data.length;
      if (len == 30)
      {
        tickValues = [
          this.state.data[0].periodName,
          this.state.data[10].periodName,
          this.state.data[20].periodName,
          this.state.data[len - 1].periodName,
        ];
      }

      return (
        <VictoryChart >
          <VictoryAxis dependentAxis 
                        standalone={false}
                        tickLabelComponent={<VictoryLabel text={(d) => this.formatYAxisValue(md, d) + " "}/>}
                        offsetX={50}
                        orientation="left"
                        style={{
                          axis: {stroke: "#EEEEEE"},
                          grid: {stroke: () => "#EEEEEE"},
                          tickLabels: {fill: '#888888', fontSize: 12, }
                        }}
          />
          <VictoryAxis dependentAxis crossAxis
                        standalone={false}
                        tickValues={tickValues}
                        orientation="bottom"
                        style={{
                          axis: {stroke: "#CCCCCC"},
                          tickLabels: {fill: '#888888', fontSize: 12}
                        }}
          />
          <VictoryBar data={this.state.data} x="periodName" y="value" 
                      style={{ height: 60, data: { fill: md.color } }}
          />
        </VictoryChart>
     );
    }
    else if (this.state.data && this.state.totalValue == 0)
    {
      return (
        <Text style={styles.loading}>No data for this period</Text>
      );
 
    }
    else
    {
      return (
        <Text style={styles.loading}>Loading...</Text>
      );
    }
  }

  render() 
  {
    const md = this.props.metricsDef;
    const period = this.period();
    
    return (
      <View style={styles.container} >
        <View style={styles.header}>
          <Text style={styles.description}>{md.description.toUpperCase()}</Text>
          <View style={styles.totalBadgeContainer}>
            <View style={styles.totalBadge}>
              <Text style={styles.totalValue}>
                {(md.type == 'AMOUNT' ? '$' : '') + numeral(this.state.totalValue).format("0,0")}
              </Text>
            </View>
          </View>
        </View>
        {this.renderChart()}
      </View>
    );
  }
}

let styles = createStyles();

function createStyles()
{
  const styles = StyleSheet.create({
    container:
    {
      paddingLeft: 10,
      paddingRight: 10,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
      height: 330,
      flex: 1,
      flexDirection: 'column',
    },

    loading:
    {
      flex: 1,
      textAlign: 'center',
      alignSelf: 'center',
      paddingTop: 120,
      fontSize: 16,
    },

    header:
    {
      paddingTop: 10,
      paddingLeft: 10,
      paddingRight: 10,
      flexDirection: 'row',
      height: 40,
      alignContent: 'center',
    },

    description:
    {
      flex: 1,
      color: '#578E8F',
      fontSize: 15,
      height: 70,
      marginTop: 5,
    },

    totalBadgeContainer:
    {
      width: 100,
      alignItems: 'flex-end',
     },

    totalBadge:
    {
      backgroundColor: '#578E8F',
      borderRadius: 5,
    },

    totalValue:
    {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 'bold',
      padding: 5,
      paddingLeft: 10,
      paddingRight: 10,
    }
  });

  return styles;
}