declare module "choices.js" {
	export default class Choices {
		passedElement: Element;

		constructor(element?: string | HTMLElement | HTMLCollectionOf<HTMLElement> | NodeList, userConfig?: ChoicesOptions);
		new(element?: string | HTMLElement | HTMLCollectionOf<HTMLElement> | NodeList, userConfig?: ChoicesOptions): this;

		/**
		* Initialise Choices
		* @return
		* @public
		*/
	 init(): void

	 /**
		* Destroy Choices and nullify values
		* @return
		* @public
		*/
	 destroy(): void

	 /**
		* Render group choices into a DOM fragment and append to choice list
		* @param  {Array} groups    Groups to add to list
		* @param  {Array} choices   Choices to add to groups
		* @param  {DocumentFragment} fragment Fragment to add groups and options to (optional)
		* @return {DocumentFragment} Populated options fragment
		* @private
		*/
	 renderGroups(groups: any[], choices: any[], fragment?: DocumentFragment): DocumentFragment

	 /**
		* Render choices into a DOM fragment and append to choice list
		* @param  {Array} choices    Choices to add to list
		* @param  {DocumentFragment} fragment Fragment to add choices to (optional)
		* @return {DocumentFragment} Populated choices fragment
		* @private
		*/
		renderChoices(choices: any[], fragment?: DocumentFragment): DocumentFragment

	 /**
		* Render items into a DOM fragment and append to items list
		* @param  {Array} items    Items to add to list
		* @param  {DocumentFragment} fragment Fragrment to add items to (optional)
		* @return
		* @private
		*/
	 renderItems(items: any[], fragment?: DocumentFragment): void

	 /**
		* Render DOM with values
		* @return
		* @private
		*/
	 render(): void

	 /**
		* Select item (a selected item can be deleted)
		* @param  {Element} item Element to select
		* @param  {boolean} runEvent Whether to highlight immediately or not. Defaults to true.
		* @return {Object} Class instance
		* @public
		*/
	 highlightItem(item: Element, runEvent?: boolean): this

	 /**
		* Deselect item
		* @param  {Element} item Element to de-select
		* @return {Object} Class instance
		* @public
		*/
		unhighlightItem(item: Element): this

	 /**
		* Highlight items within store
		* @return {Object} Class instance
		* @public
		*/
	 highlightAll(): this

	 /**
		* Deselect items within store
		* @return {Object} Class instance
		* @public
		*/
	 unhighlightAll(): this

	 /**
		* Remove an item from the store by its value
		* @param  {String} value Value to search for
		* @return {Object} Class instance
		* @public
		*/
	 removeItemsByValue(value: string): this

	 /**
		* Remove all items from store array
		* @note Removed items are soft deleted
		* @param  {Number} excludedId Optionally exclude item by ID
		* @return {Object} Class instance
		* @public
		*/
	 removeActiveItems(excludedId?: number): this

	 /**
		* Remove all selected items from store
		* @note Removed items are soft deleted
		* @param {boolean} runEvent Whether to remove highlighted items immediately or not. Defaults to false.
		* @return {Object} Class instance
		* @public
		*/
	 removeHighlightedItems(runEvent?: boolean): this

	 /**
		* Show dropdown to user by adding active state class
		* @param {boolean} focusInput Whether to focus the input or not. Defaults to false.
		* @return {Object} Class instance
		* @public
		*/
	 showDropdown(focusInput?: boolean): this

	 /**
		* Hide dropdown from user
		* @param {boolean} focusInput Whether to blur input focus or not. Defaults to false.
		* @return {Object} Class instance
		* @public
		*/
	 hideDropdown(blurInput?: boolean): this

	 /**
		* Determine whether to hide or show dropdown based on its current state
		* @return {Object} Class instance
		* @public
		*/
	 toggleDropdown(): this

	 /**
		* Get value(s) of input (i.e. inputted items (text) or selected choices (select))
		* @param {Boolean} valueOnly Get only values of selected items, otherwise return selected items
		* @return {Array/String} selected value (select-one) or array of selected items (inputs & select-multiple)
		* @public
		*/
	 getValue(valueOnly?: boolean): string | string[]

	 /**
		* Set value of input. If the input is a select box, a choice will be created and selected otherwise
		* an item will created directly.
		* @param  {Array}   args  Array of value objects or value strings
		* @return {Object} Class instance
		* @public
		*/
	 setValue(args: any[]): this

	 /**
		* Select value of select box via the value of an existing choice
		* @param {Array/String} value An array of strings of a single string
		* @return {Object} Class instance
		* @public
		*/
	 setValueByChoice(value: string | string[]): this

	 /**
		* Direct populate choices
		* @param  {Array} choices - Choices to insert
		* @param  {String} value - Name of 'value' property
		* @param  {String} label - Name of 'label' property
		* @param  {Boolean} replaceChoices Whether existing choices should be removed
		* @return {Object} Class instance
		* @public
		*/
	 setChoices(choices: any[], value: string, label: string, replaceChoices?: boolean): this

	 /**
		* Clear items,choices and groups
		* @note Hard delete
		* @return {Object} Class instance
		* @public
		*/
	 clearStore(): this

	 /**
		* Set value of input to blank
		* @return {Object} Class instance
		* @public
		*/
	 clearInput(): this

	 /**
		* Enable interaction with Choices
		* @return {Object} Class instance
		*/
	enable(): this

	 /**
		* Disable interaction with Choices
		* @return {Object} Class instance
		* @public
		*/
	disable(): this

	 /**
		* Populate options via ajax callback
		* @param  {Function} fn Passed
		* @return {Object} Class instance
		* @public
		*/
	 ajax(fn: (values: any) => any): this
	}

	export interface ChoicesOptions {
		silent?: boolean,
		items?: any[],
		choices?: any[],
		maxItemCount?: -1,
		addItems?: boolean,
		removeItems?: boolean,
		removeItemButton?: boolean,
		editItems?: boolean,
		duplicateItems?: boolean,
		delimiter?: string,
		paste?: boolean,
		searchEnabled?: boolean,
		searchChoices?: boolean,
		searchFloor?: number,
		searchResultLimit?: number,
		searchFields?: string[],
		position?: string,
		resetScrollPosition?: boolean,
		regexFilter?: null,
		shouldSort?: boolean,
		sortFilter?: (current: any, next: any) => -1 | 0 | 1,
		placeholder?: boolean,
		placeholderValue?: string,
		prependValue?: null,
		appendValue?: null,
		loadingText?: string,
		noResultsText?: string,
		noChoicesText?: string,
		itemSelectText?: string,
		addItemText?: (value: any) => string,
		maxItemText?: (maxItemCount: number) => string,
		uniqueItemText?: string,
		classNames?: {
			containerOuter?: string,
			containerInner?: string,
			input?: string,
			inputCloned?: string,
			list?: string,
			listItems?: string,
			listSingle?: string,
			listDropdown?: string,
			item?: string,
			itemSelectable?: string,
			itemDisabled?: string,
			itemChoice?: string,
			placeholder?: string,
			group?: string,
			groupHeading?: string,
			button?: string,
			activeState?: string,
			focusState?: string,
			openState?: string,
			disabledState?: string,
			highlightedState?: string,
			hiddenState?: string,
			flippedState?: string,
			loadingState?: string,
		},
		fuseOptions?: {
			include?: string,
		},
		callbackOnInit?: () => any,
		callbackOnCreateTemplates?: () => any,
	}
}
