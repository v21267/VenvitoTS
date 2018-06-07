import React, { Component, PureComponent } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Button
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import numeral from 'numeral';
import prompt from 'react-native-prompt-android';

import VenvitoService from '../utils/venvitoservice';
import observableStore from '../utils/store';

const COUNT_FONT_SIZE = 24;
const ROW_HEIGHT = 60;

const ios = (Platform.OS == 'ios');

export default class ActivityRow extends PureComponent 
{
  constructor(props)
  {
    super(props);
  }

  componentWillMount()
  {
    this.calculateMaxCountWidth();
  }

  componentWillUpdate()
  {
    this.calculateMaxCountWidth();
  }

  updateMetricsData(md)
  {
    VenvitoService.updateMetricsData(md);
  }

  updateCount(delta)
  {
    const md =  { ...this.props.data };
    if (md.value + delta < 0) return;

    md.value += delta;
    this.updateMetricsData(md);

    this.calculateMaxCountWidth();
  }

  editAmount()
  {
    const d = this.props.data;

    prompt(
      d.description.toUpperCase(),
      '',
      [
       {text: 'Cancel', onPress: () => {}, style: 'cancel'},
       {text: 'Save', onPress: (value) => this.handleAmountChange(value)},
      ],
      {
        type: (ios ? 'plain-text' : 'numeric'),
        keyboardType: 'numeric',
        defaultValue: '' + (d.value == 0 ? '' : d.value),
        placeholder: ''
      }
    );
    // AlertIOS.prompt(title, message, callbackOrButtons, options.type, options.defaultValue, options.keyboardType);
  }

  handleAmountChange(newValue)
  {
    const newAmount = parseInt(newValue);
    if (newAmount < 0) return;

    const md =  { ...this.props.data };
    md.value = newAmount;
    this.updateMetricsData(md);
  }

  calculateMaxCountWidth()
  {
    if (observableStore.maxCountWidth > 0) return;
    
    let maxLen = 0;
    observableStore.data.map(md =>
    {
      if (md.type == 'COUNT') 
      {
        const len = ("" + md.value).length;
        if (len > maxLen) maxLen = len;
      }
    });
    observableStore.maxCountWidth = maxLen * 15 + 10;

    styles = createStyles();
  }
 
  render() 
  {
    const d = this.props.data;

    return (
      <View style={styles.container}>
        <View style={{backgroundColor: d.color, width: 5, height: ROW_HEIGHT}}/>
        {(d.type == 'COUNT' ? this.renderCountRow() : this.renderAmountRow())}
    </View>
    
     );
  }

  renderCountRow()
  {
    const d = this.props.data;

    return (
      <View style={styles.content}>
        <View style={styles.leftContainer}>
          <Text style={styles.countValue}>{d.value}</Text>
          <Text style={styles.countDescription}>{d.description}</Text>
        </View>
        <View style={styles.rightContainer}>
          <TouchableHighlight onPress={() => this.updateCount(-1)} style={styles.button}>
            <Icon name='minus' size={32} color="#009CDE"></Icon>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => this.updateCount(1)} style={styles.button}>
            <Icon name='plus' size={24} color="#009CDE"></Icon>
          </TouchableHighlight>
        </View>
      </View>
    );
  }

  renderAmountRow()
  {
    const d = this.props.data;
    const desc = d.description.toUpperCase();
    
    return (
      <View style={styles.content}>
        <View style={styles.leftContainerAmount}>
          <Text style={styles.amountDescription}>{desc}</Text>
          <Text style={styles.amountValue}>{"$" + numeral(d.value).format("0,0")}</Text>
        </View>
        <View style={styles.rightContainerAmount}>
          <TouchableHighlight style={styles.editButton} onPress={() => this.editAmount()}>
            <Text style={styles.editButtonText}>EDIT</Text>
          </TouchableHighlight>
        </View>
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
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
    },

    content:
    {
      paddingLeft: 10,
      flexDirection: 'row',
    },

    countValue:
    {
      textAlign: 'right',
      paddingLeft: 0,
      paddingRight: 2,
      marginTop: (ios ? 4 : 0),
      fontSize: COUNT_FONT_SIZE,
      color: '#000000',
      width: observableStore.maxCountWidth,
    },
  
    countDescription:
    {
      paddingLeft: 5,
      fontSize: 12,
      color: '#000000',
      marginTop: 15,
    },

    leftContainer: 
    {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      paddingTop: 12,
    },

    rightContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingLeft: 5,
      paddingRight: 10,
    },
    
    button: 
    {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 0,
      marginBottom: 0,
      paddingLeft: 15,
      paddingRight: 15,
      borderLeftWidth: 1,
      borderLeftColor: '#EEEEEE',
    //   backgroundColor: '#cccccc',
      height: ROW_HEIGHT ,
      width: 60,
    },


    leftContainerAmount: 
    {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      paddingLeft: 5,
      paddingTop: 3,
    },

    amountValue:
    {
      paddingLeft: 0,
      marginTop: (ios ? 6 : 0),
      fontSize: 20,
      color: '#000000',
    },
  
    amountDescription:
    {
      paddingLeft: 0,
      fontSize: 12,
      color: '#CCCCCC',
    },

    rightContainerAmount: 
    {
      flexDirection: 'column',
      alignItems: 'stretch',
      alignContent: 'stretch',
      marginTop: 0,
      marginBottom: 0,
      paddingLeft: 15,
      paddingRight: 15,
      borderLeftWidth: 1,
      borderLeftColor: '#EEEEEE',
      height:ROW_HEIGHT,
      width: 130,
    },

    editButton:
    {
      width: 130,
      height: ROW_HEIGHT,
    },

    editButtonText:
    {
      color: "#009CDE",
      textAlign: 'center',
      fontSize: 18,
  //    backgroundColor: '#cccccc',
      width: 90,
      height: ROW_HEIGHT,
      paddingTop: 20,
    },
  });

  return styles;
}