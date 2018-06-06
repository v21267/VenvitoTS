import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import numeral from 'numeral';
import moment from 'moment';
import {observer} from 'mobx-react/native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel } from "victory-native";

import VenvitoService from '../utils/venvitoservice';
import observableStore from '../utils/store';

const ios = (Platform.OS == 'ios');

export default class DashboardChart extends Component 
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
    const data = this.props.data;
    const totalValue = this.props.totalValue;

    let tickValues = null;
    
    if (data && totalValue > 0)
    {
      const len = data.length;
      if (len == 30)
      {
        tickValues = [
          data[0].periodName,
          data[10].periodName,
          data[20].periodName,
          data[len - 1].periodName,
        ];
      }

      const dataCopy = data.map(d => { return {...d}; });
  //    return (<Text>{JSON.stringify(dataCopy)}</Text>);
  
      return (
        <VictoryChart>
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
          <VictoryBar data={dataCopy} x="periodName" y="value" 
                      style={{ height: 60, data: { fill: md.color } }}
          />
        </VictoryChart>
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