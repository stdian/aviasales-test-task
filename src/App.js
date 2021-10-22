import React from 'react'

import Logo from './assets/Logo.svg';

import './App.css';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tickets: [],
			searchID: '',
			stopSearch: false,
			isLoading: true,
		};
	}

	async getPackOfTickets() {
		if (!this.state.stopSearch) {
			fetch("https://front-test.beta.aviasales.ru/tickets?searchId=" + this.state.searchID)
			.then(response => {
				if (response.status === 200) return response.json()
				return {error: response.status}
			})
			.then(json => {
				if ('error' in json) {
					this.getPackOfTickets()
				} else {
					let tickets = this.state.tickets
					tickets = tickets.concat(json.tickets)
					this.setState({tickets: tickets})
					console.log(this.state.tickets);
					// console.log(json.tickets);
					this.setState({isLoading: false})
					if (json.stop) {
						this.setState({stopSearch: true})
					}
				}
			})
		}
	}

	async getSearchID() {
		await fetch('https://front-test.beta.aviasales.ru/search')
		.then(response => response.json())
		.then(json => {
			this.setState({searchID: json.searchId})
		})
	}

	async componentDidMount() {
		await this.getSearchID()
		this.getPackOfTickets()
	}

	render() {
		if (this.state.isLoading) {
			return (<div></div>)
		}
		return (
			<div className="App">
				<img className="App-logo" src={Logo}></img>
				<div className="App-content">
					<div className="App-content-left">
						
					</div>
					<div className="App-content-right">
						<div className="App-content-tabs">
						
						</div>
						<div className="App-content-tickets">
							{this.state.tickets.map((ticket => {
								return (
									<div className="App-ticket">
										<div className="App-ticket-header">
											<p className="App-ticket-price">{ticket.price} Р</p>
											<img className="App-ticket-carrier-logo" src={'http://pics.avs.io/99/36/' + ticket.carrier + '.png'}></img>
										</div>
										
									</div>
								)
							}))}
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default App;
