import React, { Component } from 'react';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

class App extends Component {
    constructor() {
        super();

        this.state = {
            value: '',
            notes: [],
        };
    }

    handleInputChange = (e) => {
        this.setState({
            value: e.target.value,
        });
    }

    handleNoteSave = (e) => {
        e.preventDefault();

        if (this.state.value.length === 0) {
            return;
        }

        const notes = [...this.state.notes];
        notes.push(this.state.value);

        this.setState({
            notes,
            value: '',
        }, () => {
            ipcRenderer.send('notes', this.state.notes);
        });
    }

    handleNoteDelete = (e) => {

    }

    render() {
        const {
            value,
            notes,
        } = this.state;

        return (
            <React.Fragment>
                <div className="triangle" />

                <div
                    className="app"
                >
                    <form
                        className="input-with-button"
                        onSubmit={this.handleNoteSave}
                    >  
                        <input
                            type="text"
                            value={value}
                            onChange={this.handleInputChange}
                        />
                        <button
                            type="submit"
                        >
                            Save
                        </button>
                    </form>

                    <ul
                        className="notes-list"
                    >
                        {
                            notes.map((event) => {
                                return (
                                    <li
                                        key={event}
                                    >
                                        <p>{ event }</p>
                                        <button
                                            onClick={this.handleNoteDelete}
                                        >
                                            x
                                        </button>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
            </React.Fragment>
        );
    }
}

export default App;
