import React, { Component } from 'react';

class App extends Component {
    constructor() {
        super();

        this.state = {
            value: '',
            events: [],
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

        const events = [...this.state.events];
        events.push(this.state.value);

        this.setState({
            events,
            value: '',
        });
    }

    render() {
        const {
            value,
            events,
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

                    <ul>
                        {
                            events.map((event) => {
                                return (
                                    <li>
                                        { event }
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
