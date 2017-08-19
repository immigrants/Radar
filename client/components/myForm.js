import React from 'react'
import { connect } from 'react-redux'
import {Link} from 'react-router-dom'
import { fetchUsers, fetchDatabase, searchDatabase, fetchFields, fetchDatabases,fetchTables, currentDatabase, fetchGraphs, saveGraph, fetchQueryTable } from '../store'
import {ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts'
import {FormControl, ControlLabel, FormGroup, Button, Well} from 'react-bootstrap'
import {saveFile} from '../../utils/saveFile'
import {newGraphMaker} from '../../utils/graphUtility'

class myForm extends React.Component {

  constructor() {
    super()
    this.state = {
      selectThese: [],
      whereThese: [], //objects of Nested Wheres???
      orderedBy: ['Descending', 0 ],
      conditionals : ['greater than', 'greater than or equal to', 'less than', 'less than or equal to','equal to', 'not', 'between', 'not between'],
      conditionalOperator: ['>', '>=', '<', '<=', '=', '!=', '[]', '![]'],
      orderType : ['None','Ascending', 'Descending'],
      chartTypes: ['Scatter', 'Area', 'Bar', 'Line', 'Pie', 'Table'],
      currentTable : '',
      currentDatabase : '',
      AndOr: '',
      choosenChart: 'Scatter',
      Title: '',
      xAxis: '',
      yAxis: '',
      height: '',
      width: '',
      pieKey: '',
    }
  }

  componentDidMount() {
    let db = this.props.match.params.dbName
    this.setState({currentDatabase: db})
    this.props.fetchDat({ database: db})
    this.props.loadCreatedGraphs()
    if(this.props.tables) this.setState({currentTable: this.props.tables[0]})
  }


  handleChange = (index, fromWhere, evt ) => {
    const type = evt.target.name
    const value = evt.target.value
    let newVal = (fromWhere === 'whereThese') ? {} : value
    if(fromWhere === 'whereThese'){
      if(type === 'is'){
        newVal[type] = this.state.conditionalOperator[value]
        newVal.literal = value
      }
      else newVal[type] = value
    }

    this.setState( (prevState) => ( { [fromWhere]: prevState[fromWhere].map( (val, i) => {
        if (index != i ) return val
        if (fromWhere === 'whereThese'){
          return {...val, ...newVal}
        }
        return newVal
    })}))
  }

  handleChartChange = (fromWhere, evt) => {
    this.setState({
      [fromWhere]: evt.target.value
    })
  }

  handleAdd = (addTo, evt) => {
    let newAdd = (addTo === 'selectThese') ? this.props.columns[0] : {col:this.props.columns[0], is: '>', spec: '' , literal:'greater than'}
    this.setState( (prevState) => ({ [addTo]: [...prevState[addTo], newAdd] }))
  }

  handleRemove = (index, fromWhere, evt) => {
    this.setState( (prevState) => ({
      [fromWhere]: [...prevState[fromWhere].slice(0, index), ...prevState[fromWhere].slice(index + 1)]
    }))
  }

  makeGraph = (evt) => {
    evt.preventDefault()
    let settings = {
      whereThese: this.state.whereThese,
      selectThese: this.state.selectThese,
      Title: this.state.Title,
      width: this.state.width,
      height: this.state.height,
      xAxis: this.state.xAxis,
      yAxis: this.state.yAxis,
      orderedBy: this.state.orderedBy,
      currentTable: this.state.currentTable,
      currentDatabase : this.state.currentDatabase,
      AndOr: this.state.AndOr || 'AND',
      choosenChart: this.state.choosenChart,
      fields: this.props.fields,
      pieKey: this.state.pieKey
    }
    this.props.savingGraph(this.state.currentDatabase, this.state.currentTable, settings)  // second argument should be settings of graph
  }

  handleTableChange = (evt) => {
    const currentTable = evt.target.value
    this.setState({ currentTable: currentTable })
    this.props.grabTableData(this.state.currentDatabase, currentTable)
    this.props.loadCreatedGraphs()
  }

  render () {
    return <MyFormContainer />
  }
}

const mapState = state => {
  return ({
    tables: state.tables,
    columns: state.fields.map(val => val.name),
    createdGraphs: state.createdGraphs,
    database: state.queriedTable,
    fields: state.fields,
    columnType: state.fields.map(val => val.dataTypeID)
  })
}

const mapDispatch = dispatch => {
  return ({
    fetchDat (DBname) {
      dispatch( fetchTables(DBname) )
    },
    grabTableData(database, table) {
      dispatch( fetchFields({ database, table}))
    },
    loadCreatedGraphs(){
      dispatch(fetchGraphs())
    },
    savingGraph(currentDatabase, currentTable, settings){  // settings of graph applied to newSettings
      let newGraphInfo = {
        database: currentDatabase,
        table: currentTable,
        settings: settings
      }
      dispatch(saveGraph(newGraphInfo))
    },
    queryDatabase(settings, fields){
      const newSettings = {
        ...settings,
        fields
      }
      dispatch(fetchQueryTable(newSettings))
    }
  })
}

export default connect(mapState, mapDispatch)(myForm)
