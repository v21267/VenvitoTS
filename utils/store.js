import {observable} from 'mobx';
import VenvitoService from './venvitoservice';

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
 }

const observableStore = new ObservableStore();
export default observableStore;