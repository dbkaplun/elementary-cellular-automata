import React from 'react';
import Head from 'next/head';

import style from '../styles/pages/index.less';

export function binToNumber (arr) {
  return arr.reduce((memo, el) => ((memo << 1) | el), 0);
};

export function last (arr) {
  return arr[arr.length - 1];
}

export const ElementaryCellularAutomata = {
  CELL_ON:  'O',
  CELL_OFF: '-',
  stringify (row) {
    return row
      .map(cell => (
        cell
          ? ElementaryCellularAutomata.CELL_ON
          : ElementaryCellularAutomata.CELL_OFF
      ))
      .join('');
  },
  step (rule, row) {
    var result = [];
    for (var i = -1; i < row.length + 1; i++) {
      result.push((rule >> binToNumber([
        row[i - 1] || 0,
        row[i] || 0,
        row[i + 1] || 0
      ])) & 1);
    };
    return result;
  }
};

export default class Home extends React.Component {
  constructor (...args) {
    super(...args);
    this.state = {
      rule: 110,
      coolRules: [110, 102, 126, 50, 137, 75, 135, 169, 254],
      initialRow: [0, 1, 0],
      rowCount: 50,
      size: 10,
      stepMs: 50,

      rows: [],
      stepCount: 0,
      interval: null
    };

    [
      'reset', 'step', 'clearInterval', 'setInterval', 'setRule',
      'onRuleChange', 'onInitialChange', 'onRowCountChange', 'onSizeChange',
      'onStepMsChange', 'onStepClick', 'onPlayPauseClick', 'onStopClick'
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount () {
    this.context = this.refs.canvas.getContext('2d');
  }

  componentDidUpdate (prevProps, prevState) {
    let {rows, size} = this.state;
    if (prevState.rows !== this.state.rows) {
      rows.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell) {
            this.context.fillRect(j*size, i*size, size, size);
          }
        });
      });
    }
  }
  
  reset () {
    this.setState({
      rows: [],
      stepCount: 0
    });
    this.clearInterval();
  }

  step () {
    let {rule, initialRow, rowCount, rows, stepCount, size} = this.state;
    rows = rows
      .map(row => [0, ...row, 0])
      .concat([rows.length
        ? ElementaryCellularAutomata.step(rule, last(rows))
        : initialRow])
      .slice(-rowCount);
    this.setState({rows, stepCount: stepCount + 1});
  }

  clearInterval () {
    let {interval} = this.state;
    if (interval) {
      clearInterval(interval);
      this.setState({interval: null});
    }
  }

  setInterval () {
    this.clearInterval();
    this.setState({interval: setInterval(this.step, this.state.stepMs)});
  }
  
  setRule (rule) {
    this.setState({rule});
    this.reset();
  }

  onRuleChange (evt) {
    this.setRule(evt.target.value);
  }

  onInitialChange (evt, i) {
    let {initialRow} = this.state;
    initialRow.splice(i, 1, evt.target.checked);
    // while (!initialRow[0])                 { initialRow.shift(); }
    // while (!initialRow[initialRow.length]) { initialRow.pop(); }
    if (initialRow[0])                     { initialRow.unshift(0); }
    if (initialRow[initialRow.length - 1]) { initialRow.push(0);    }

    this.setState({initialRow});
    this.reset();
  }

  onRowCountChange (evt) {
    this.setState({rowCount: evt.target.value});
    this.reset();
  }

  onSizeChange (evt) {
    this.setState({size: evt.target.value});
  }

  onStepMsChange (evt) {
    let stepMs = evt.target.value;
    this.setState({stepMs});

    if (this.state.interval) {
      this.setInterval();
    }
  }

  onStepClick (evt) {
    this.step();
  }

  onPlayPauseClick (evt) {
    if (!this.state.interval) {
      this.step();
      this.setInterval();
    } else {
      this.clearInterval();
    }
  }

  onStopClick (evt) {
    this.reset();
  }

  render () {
    let {state} = this;
    let {size} = state;
    return (
      <div className="container">
        <Head>
          <style dangerouslySetInnerHTML={{__html: style}} />
          <style>
            .cell {'{'}
              width:  {state.size}px !important;
              height: {state.size}px !important;
            {'}'}
          </style>
          <title>Elementary cellular automata</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <div className="col-sm-5">
          <h1>Elementary cellular automata</h1>
          <blockquote>
            <p>
              In mathematics and computability theory, an elementary cellular
              automaton is a one-dimensional cellular automaton where there are
              two possible states (labeled 0 and 1) and the rule to determine
              the state of a cell in the next generation depends only on the
              current state of the cell and its two immediate neighbors. As such
              it is one of the simplest possible models of computation.
              Nevertheless, there is an elementary cellular automaton (rule 110,
              defined below) which is capable of universal computation.
            </p>
            <footer>Wikipedia article on <cite title="Wikipedia"><a href="http://en.wikipedia.org/wiki/Elementary_cellular_automaton">elementary cellular automata</a></cite></footer>
          </blockquote>

          <form className="form-horizontal" onSubmit={evt=>{evt.preventDefault()}} role="form">
            <div className="form-group">
              <label htmlFor="rule" className="col-sm-4 control-label">Rule</label>
              <div className="col-sm-8">
                <input type="number" value={state.rule} onChange={this.onRuleChange} min="0" max="255" name="rule" className="form-control" />
                <span className="text-muted">
                  Cool rules:
                  {state.coolRules.map((rule, i) => [
                    ' ',
                    <a onClick={()=>{this.setRule(rule)}}>{rule}</a>
                  ])}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-4 control-label">Initial state</label>
              <div className="col-sm-8">
                <span>
                  {state.initialRow.map((cell, i) => (
                    <input
                      type="checkbox"
                      checked={cell}
                      onChange={evt=>{this.onInitialChange(evt, i)}}
                      key={`initial-row-${i}`} />
                  ))}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="rowCount" className="col-sm-4 control-label">
                <span>Row count</span>
                <br />
                <small className="text-muted">May cause slowness</small>
              </label>
              <div className="col-sm-8">
                <input type="number" value={state.rowCount} onChange={this.onRowCountChange} min="1" max="200" name="rowCount" className="form-control" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="size" className="col-sm-4 control-label">Size</label>
              <div className="col-sm-8">
                <input type="number" value={state.size} onChange={this.onSizeChange} min="1" max="100" name="size" className="form-control" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="stepMs" className="col-sm-4 control-label">Speed</label>
              <div className="col-sm-8">
                <input type="range" value={state.stepMs} onChange={this.onStepMsChange} min="1" max="100" name="stepMs" />
              </div>
            </div>

            <div className="form-group">
              <div className="btn-group col-sm-offset-4 col-sm-8" role="group" aria-label="...">
                <button onClick={this.onStepClick} type="button" className="btn btn-default">
                  <span className="glyphicon glyphicon-step-forward" />
                </button>
                <button onClick={this.onPlayPauseClick} type="button" className={`btn btn-success ${state.interval ? 'active' : ''}`}>
                  <span className="glyphicon glyphicon-play" />
                </button>
                <button onClick={this.onStopClick} type="button" className="btn btn-default">
                  <span className="glyphicon glyphicon-stop" />
                </button>
              </div>
              <span className="text-muted">
                Iteration count: <span>{state.stepCount}</span>
              </span>
            </div>
          </form>
        </div>

        {/* <pre>
          {state.rows
            .map(ElementaryCellularAutomata.stringify)
            .join('\n')
          }
        </pre> */}
        <div className="col-sm-7 font-size-0">
          <canvas ref="canvas"
            width={state.rows.length ? state.rows[0].length * size : 0}
            height={state.rows.length * size}
          />
        </div>

        <a href="https://github.com/dbkaplun/elementary-cellular-automata" className="fork-me">
          <img src="https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png" />
        </a>
      </div>
    );
  }
};
