export const remote = {
	dialog: {
		showOpenDialog: jest.fn(),
		showSaveDialog: jest.fn()
	},
	app: {
		getPath: jest.fn()
	}
}