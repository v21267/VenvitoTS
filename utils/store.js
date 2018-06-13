import {observable, action, configure} from 'mobx';
import VenvitoService from './venvitoservice';

configure({enforceActions: true});

class ObservableStore 
{
  @observable currentPageIndex = 0;
  @observable currentPage = 'activity';
  @observable currentDate = VenvitoService.initialDate;
  @observable data = null;
  @observable maxCountWidth = 0;
  @observable chartPeriod = '7';
  @observable chartData = null;
  @observable getChartDataDuration = 0;
  

  @action setCurrentPage = (index, page) => 
  {
    this.currentPageIndex = index;
    this.currentPage = page;
  }

  @action setCurrentDate = (date) => this.currentDate = date;

  @action setData = (data) => this.data = data;

  @action setMaxCountWidth = (width) => this.maxCountWidth = width;

  @action setChartPeriod = (chartPeriod) => this.chartPeriod = chartPeriod;

  @action setChartData = (chartData) => this.chartData = chartData;

  @action setGetChartDataDuration = (duration) => this.getChartDataDuration = duration;

 }

const observableStore = new ObservableStore();
export default observableStore;