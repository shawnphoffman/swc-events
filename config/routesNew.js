const Routes = {
	Home: {
		path: '/schedule',
		icon: 'fa-calendar-days',
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
		path: '/login',
		icon: 'fa-user',
		title: 'Login',
	},
	Logout: {
		icon: 'fa-right-from-bracket',
		title: 'Logout',
	},
	User: {
		path: '/login',
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
		path: '/print',
		icon: 'fa-print',
		title: 'Print',
	},
	Vendors: {
		path: '/vendors',
		icon: 'fa-store',
		title: 'Vendors',
	},
	Tattoos: {
		path: '/tattoos',
		icon: 'fa-paintbrush',
		title: 'Tattoos',
	},
	Map: {
		path: '/map',
		icon: 'fa-map',
		title: 'Map',
	},
}

export const RegisteredRoutes = [
	Routes.FAQ,
	Routes.PrintUserFavorites,
	Routes.Favorites,
	Routes.Search,
	Routes.Login,
	Routes.Temp,
	Routes.EventDetails,
	Routes.VenueDetails,
	Routes.FavoritesList,
	Routes.Vendors,
	Routes.Tattoos,
	Routes.Map,
	Routes.PrintSchedule,
	Routes.Home,
]

export const NavRoutes = [
	Routes.Home,
	Routes.Search,
	Routes.Favorites,
	Routes.Vendors,
	Routes.Tattoos,
	Routes.Map,
	// ...(process.env.NODE_ENV === 'development' ? [Routes.Tattoos] : []),
	Routes.FAQ,
]

export default Routes
