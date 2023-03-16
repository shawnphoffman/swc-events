import { memo } from 'react'
import { styled } from 'linaria/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { brands } from '@fortawesome/fontawesome-svg-core/import.macro'

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 0;
`
const Spinner = styled.div`
	font-size: 46px;
	margin: 16px;
`
const InlineSpinner = styled.div`
	font-size: inherit;
	margin: 0;
	position: fixed;
	right: 16px;
`

const Loading = ({ inline }) => {
	if (inline) {
		return (
			<InlineSpinner>
				<FontAwesomeIcon icon={brands('galactic-republic')} beat />
			</InlineSpinner>
		)
	}
	return (
		<Wrapper>
			<Spinner>
				<FontAwesomeIcon icon={brands('galactic-republic')} beat />
			</Spinner>
		</Wrapper>
	)
}

export default memo(Loading)
