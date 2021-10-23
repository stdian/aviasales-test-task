import React from 'react'

import Logo from './assets/Logo.svg';

import './App.css';

function flightDate(date, duration) {
	let d = new Date(date)
	let d1 =  (d.getUTCHours() < 10 ? '0' : '') + d.getUTCHours().toString() + ':' + (d.getUTCMinutes() < 10 ? '0' : '') +  d.getUTCMinutes().toString()
	let d2 = (new Date(d.getTime() + duration * 60000).getUTCHours() < 10 ? '0' : '')
			 + new Date(d.getTime() + duration * 60000).getUTCHours().toString() + ':'
			 + (new Date(d.getTime() + duration * 60000).getUTCMinutes() < 10 ? '0' : '')
			 + new Date(d.getTime() + duration * 60000).getUTCMinutes().toString()
	return d1 + ' - ' + d2
}

function flightDuration(duration) {
	let h = Math.floor(duration / 60)
	let m = duration % 60
	return h + 'ч ' + m + 'м'
}

function getStopsTitle(stops) {
	if (stops.length == 0) return '0 пересадок'
	if (stops.length == 1) return '1 пересадка'
	if (stops.length >= 2 && stops.length <= 4) return stops.length + ' пересадки'
	return stops.length + ' пересадок'
}

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
										<div className="App-ticket-content">
											<table className="App-ticket-table">
												<tbody>
													<tr>
														<td>
															<p className="App-ticket-table-gray">{ticket.segments[0].origin} - {ticket.segments[0].destination}</p>
															<p className="App-ticket-table-black">{flightDate(ticket.segments[0].date, ticket.segments[0].duration)}</p>
														</td>
														<td>
															<p className="App-ticket-table-gray">В пути</p>
															<p className="App-ticket-table-black">{flightDuration(ticket.segments[0].duration)}</p>
														</td>
														<td>
															<p className="App-ticket-table-gray">{getStopsTitle(ticket.segments[0].stops)}</p>
														</td>
													</tr>
													<tr>
														<td>
															<p className="App-ticket-table-gray">{ticket.segments[1].origin} - {ticket.segments[1].destination}</p>
															<p className="App-ticket-table-black">{flightDate(ticket.segments[1].date, ticket.segments[1].duration)}</p>
														</td>
														<td>
															<p className="App-ticket-table-gray">В пути</p>
															<p className="App-ticket-table-black">{flightDuration(ticket.segments[1].duration)}</p>
														</td>
														<td></td>
													</tr>
												</tbody>
											</table>
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
