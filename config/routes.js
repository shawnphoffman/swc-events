const Routes = {
	Home: {
		path: '/schedule',
		icon: 'fa-calendar-lines',
		title: 'Home',
	},
	FAQ: {
		path: '/faq',
		icon: 'fa-messages-question',
		title: 'FAQ',
	},
	Search: {
		path: '/search',
		icon: 'fa-magnifying-glass',
		title: 'Search',
	},
	Favorites: {
		path: '/favorites',
		icon: 'fa-heart',
		title: 'Favorites',
	},
	PrintUserFavorites: {
		path: '/favorites/print',
		icon: 'fa-print',
		title: 'Print Favorites',
	},
	Login: {
		path: '/auth',
		icon: 'fa-user',
		title: 'Login',
	},
	Logout: {
		icon: 'fa-right-from-bracket',
		title: 'Logout',
	},
	User: {
		path: '/auth',
		icon: 'fa-user-bounty-hunter',
		title: 'User Info',
	},
	Temp: {
		path: '/temp',
		icon: 'fa-flask-vial',
		title: 'Temp Test',
	},
	EventDetails: {
		path: '/event/:id',
		title: 'Event Details',
	},
	VenueDetails: {
		path: '/venue/:venue',
		title: 'Venue Details',
	},
	FavoritesList: {
		path: '/favorites/:uid',
		title: 'User Favorites',
	},
	PrintSchedule: {
		path: '/schedule/print',
		icon: 'fa-print',
		title: 'Print',
	},
	Vendors: {
		path: '/vendors',
		icon: 'fa-cash-register',
		title: 'Vendors',
	},
	Tattoos: {
		path: '/tattoos',
		icon: 'fa-paintbrush-fine',
		title: 'Tattoos',
	},
	Reminders: {
		path: '/reminders',
		icon: 'fa-list-check',
		title: 'Reminders',
	},
}

export const NavRoutes = [
	Routes.Home,
	Routes.Search,
	Routes.Favorites,
	Routes.Vendors,
	...(process.env.NODE_ENV === 'development' ? [Routes.Tattoos] : []),
	Routes.Reminders,
	Routes.FAQ,
]

export default Routes
