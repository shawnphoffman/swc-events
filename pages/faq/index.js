/* eslint-disable react/no-unescaped-entities */
import { memo } from 'react'
import { styled } from 'linaria/react'

import { List, ListItem, NonScrollWrapper, PageTitle, Section } from 'components/styles'

const SectionTitle = styled.h3`
	margin-bottom: 16px;
	margin-top: 0px;
`
const Link = styled.a`
	color: var(--link);
	&:hover {
		color: var(--linkHover);
	}
`
const LinkItem = ({ href, children }) => {
	return (
		<ListItem>
			<Link href={href} target="_blank" rel="noreferrer">
				{children} <i className="fa-sharp fa-solid fa-up-right-from-square"></i>
			</Link>
		</ListItem>
	)
}

const Faq = () => {
	return (
		<NonScrollWrapper>
			{/*  */}
			<PageTitle>Additional Resources</PageTitle>
			<Section>
				<List>
					<LinkItem href="https://www.starwarscelebration.com/en-us/explore-the-show.html">Official Show Info</LinkItem>
					<LinkItem href="https://celebratingstarwars.blogspot.com/p/celebration-fan-events-2023.html">Additional Fan Events</LinkItem>
					<LinkItem href="https://www.reddit.com/r/StarWarsCelebration">Celebration Subreddit</LinkItem>
					<LinkItem href="https://discord.com/invite/XKa9E3Z">Celebration Discord Server</LinkItem>
					{/* <LinkItem href="https://www.starwars.com/news/star-wars-celebration-anaheim-2022-store-exclusives">
						Celebration Store Exclusives
					</LinkItem> */}
				</List>
			</Section>
			{/*  */}
			<PageTitle>Podcast Recommendations</PageTitle>
			<Section>
				<List>
					<LinkItem href="https://twitter.com/BlueHarvestPod">Blue Harvest</LinkItem>
					<LinkItem href="https://twitter.com/SteeleWars">Steele Wars</LinkItem>
					<LinkItem href="https://twitter.com/bad_motivators">The Bad Motivators</LinkItem>
					<LinkItem href="https://twitter.com/TheSithList">The Sith List</LinkItem>
					<LinkItem href="https://twitter.com/cantobightpod">The Canto Bight Dispatch</LinkItem>
					<LinkItem href="https://twitter.com/StarWarsSpelt">Star Wars Spelt Out</LinkItem>
					<LinkItem href="https://twitter.com/ScruffyPodcast">Scruffy Lookin' Podcasters</LinkItem>
					<LinkItem href="https://twitter.com/JTcomlink">Jammed Transmissions</LinkItem>
					<LinkItem href="https://twitter.com/RogueRebelsFam">Rogue Rebels</LinkItem>
					<LinkItem href="https://twitter.com/thatgeekpod">That Geek Pod</LinkItem>
				</List>
			</Section>
			{/*  */}
			<PageTitle>FAQ</PageTitle>
			{/* <Section>
				<SectionTitle>Why can't I download events on Chrome iOS?</SectionTitle>
				<div>This is an open bug with Chromium. They won't fix it. 😩</div>
			</Section> */}
			<Section>
				<SectionTitle>Can I add an event to the schedule?</SectionTitle>
				<div>
					Absolutely. Please reach out{' '}
					<Link href="https://twitter.com/iceplanethoff" target="_blank" rel="noreferrer">
						on Twitter
					</Link>{' '}
					and I'll get it added.
				</div>
			</Section>
			<Section>
				<SectionTitle>What data does this site capture or track?</SectionTitle>
				<div>
					This site doesn't record any personal information. I previously captured usage events without PII using Panelbear but I've remove
					all analytics for the 2023 Celebration.
				</div>
			</Section>
			{/*  */}
			<PageTitle>Technical Stuff</PageTitle>
			<Section>
				<List>
					<LinkItem href="https://github.com/shawnphoffman/celebration-calendar">Project Source Code</LinkItem>
					<LinkItem href="https://twitter.com/iceplanethoff">
						<i className="fa-brands fa-twitter"></i> Follow me on Twitter
					</LinkItem>
				</List>
			</Section>
		</NonScrollWrapper>
	)
}

export default memo(Faq)
