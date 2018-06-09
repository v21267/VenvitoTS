import React, { Component, PureComponent } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import numeral from 'numeral';
import moment from 'moment';
import {observer} from 'mobx-react/native';
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';

import VenvitoService from '../utils/venvitoservice';
import observableStore from '../utils/store';

const ios = (Platform.OS == 'ios');

export default class DashboardChart2 extends PureComponent 
{
  constructor(props)
  {
    super(props);
  }

  componentDidMount()
  {
  }

  componentWillUpdate()
  {
  }

  formatYAxisValue = (value) =>
  {
    const md = this.props.metricsDef;
    const suffix = ["", "k", "M", "G", "T", "P", "E"];
    let index = 0;
    let dvalue = value;
    while ((value /= 1000) >= 1 && ++index) dvalue /= 1000;
    let result =
      (md.type == "AMOUNT" ? "$" : "") +
      Math.round(dvalue).toString() + suffix[index];
    return result;
  }

  xValues = [];
  formatXAxisValue = (value, index) => this.xValues[index];

  renderChart()
  {
    const md = this.props.metricsDef;
    const data = this.props.data;
    const totalValue = this.props.totalValue;

    let tickValues = null;
    
    if (data && totalValue > 0)
    {
      
      const len = data.length;
      const dataCopy = data.map(d => { return {...d}; });
      this.xValues = data.map((d, index) => 
        { 
          return (
            len != 30 || index == 0 || index == 10 || index == 20 || index == len - 1 ? 
            d.periodName : 
            ''); 
        });
      const yValues = data.map(d => { return d.value; });

      //    return (<Text>{JSON.stringify(dataCopy)}</Text>);
  
      const fill = md.color;
      const padding = {paddingTop: 5, paddingBottom: 20, paddingRight: 0, paddingLeft: 10};
      const xAxisLeftInset = (observableStore.chartPeriod == '7' ? 15 : 25);
      const xAxisFontSize = (observableStore.chartPeriod == 'M' ? 10 : 12);

      return (
        <View style={{ height: 300, flexDirection: 'row' }}>
          <YAxis
                style={{flex: 0, height: 300, alignItems: 'flex-end',
                        ...padding}}
                data={ yValues }
                formatLabel={this.formatYAxisValue}
                svg={{ fontSize: 12, fill: '#888888', textAlign: 'right' }}
                numberOfTicks={5}
                min={0}
                contentInset={{ top: 20, bottom: 35,  }}
                />
            <View style={{ height: 300, flexDirection: 'column', flex: 1,
                           ...padding, paddingLeft: 0}}>
              <BarChart
                  style={{ height: 260, paddingLeft: 10, paddingRight: 20 }}
                  data={ yValues }
                  svg={{ fill }}
                  gridMin={ 0 }
                  numberOfTicks={5}
                  spacingInner={0.7}
                  contentInset={{ top: 20, bottom: 20,  }}
              >
                <Grid svg={{ stroke: '#EEEEEE' }} />
              </BarChart>
              <XAxis
                    data={ yValues }
                    formatLabel={this.formatXAxisValue}
                    contentInset={{ left: xAxisLeftInset, right: 25 }}
                    svg={{ fontSize: xAxisFontSize, fill: '#888888', textAlign: 'center' }}
              />
          </View>
        </View>
        );
    }
    else if (data && totalValue == 0)
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
    const data = this.props.data;
    const totalValue = this.props.totalValue;

  //  return (<Text>{JSON.stringify(data)}</Text>)
   
    return (
      <View style={styles.container} >
        <View style={styles.header}>
          <Text style={styles.description}>{md.description.toUpperCase()}</Text>
          <View style={styles.totalBadgeContainer}>
            <View style={styles.totalBadge}>
              <Text style={styles.totalValue}>
                {(md.type == 'AMOUNT' ? '$' : '') + numeral(totalValue).format("0,0")}
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
      borderBottomColor: '#BBBBBB',
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
      flex: 0,
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