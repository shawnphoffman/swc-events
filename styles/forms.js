import { styled } from 'linaria/react'

export const FormWrapper = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: 800px;
`

export const InputWrapper = styled.div`
	display: flex;
	flex-direction: row;
	width: 100%;
	margin-bottom: 8px;
`

export const InputContainer = styled.div`
	display: flex;
	flex-direction: row;
	position: relative;
	background-color: var(--inputBg);
	border-color: var(--transparent);
	border-width: 0px;
	border-style: solid;
	transition-delay: 0s;
	transition-duration: 0.2s;
	transition-property: box-shadow;
	transition-timing-function: ease-in-out;
	border-radius: 8px;
	user-select: none;
	margin-bottom: 8px;
	max-width: 1200px;
	width: 100%;

	&:hover {
		opacity: 0.9;
	}

	&:focus-within {
		border-color: var(--linkActive);
		box-shadow: 0 0 0 2px var(--inputBg);
		opacity: 1;
	}
`

export const Label = styled.label`
	font-weight: bold;
	flex: 0;
	flex-wrap: nowrap;
	white-space: nowrap;
	margin-right: 8px;
	margin-top: 8px;
`

export const TextInput = styled.input`
	margin: 0;
	padding: 8px 12px;
	font-size: 16px;
	line-height: 1;
	text-align: start;
	text-indent: 0px;
	text-transform: none;
	word-spacing: 0px;
	border-color: var(--inputBorder);
	border-style: solid;
	border-width: 0;
	background-color: var(--transparent);
	opacity: 1;
	flex: 1;

	&:focus {
		outline-style: none;
		box-shadow: none;
		border-color: var(--transparent);
	}
	&:disabled {
		background: var(--disabled);
		border-radius: 8px;
	}
`

export const ButtonWrapper = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
`

export const Error = styled.div`
	background: var(--errorBg);
	padding: 12px;
	border-radius: 8px;
	margin-bottom: 8px;
	border: 2px solid var(--errorColor);
	color: var(--errorColor);
	font-weight: bold;
`
export const DateTimeInput = styled.input`
	margin: 0;
	padding: 8px;
	font-size: 16px;
	line-height: 1;
	text-align: start;
	text-indent: 0px;
	text-transform: none;
	word-spacing: 0px;
	border-color: var(--inputBorder);
	border-style: solid;
	border-width: 0;
	background-color: var(--transparent);
	opacity: 1;
	flex: 1;

	&:focus {
		outline-style: none;
		box-shadow: none;
		border-color: var(--transparent);
	}
`
export const TextArea = styled.textarea`
	margin: 0;
	padding: 12px;
	font-size: 16px;
	line-height: 1.2;
	text-align: start;
	text-indent: 0px;
	text-transform: none;
	word-spacing: 0px;
	border-color: var(--inputBorder);
	border-style: solid;
	border-width: 0;
	background-color: var(--transparent);
	opacity: 1;
	flex: 1;

	&:focus {
		outline-style: none;
		box-shadow: none;
		border-color: var(--transparent);
	}

	width: 100%;
	height: 100px;
`
export const CheckboxWrapper = styled(InputWrapper)`
	align-items: center;
	margin-bottom: 0px;
	min-height: 40px;
`
export const CheckboxLabel = styled(Label)`
	margin-top: 0;
`
export const Checkbox = styled.input`
	height: 24px;
	width: 24px;
	min-width: 24px;
	margin-right: 16px;
`
export const CheckHint = styled.span`
	color: ${p => (p.isPrivate ? 'var(--private)' : 'var(--public)')};
`
