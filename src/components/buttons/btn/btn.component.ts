/**
* @Author: Alex Sorafumo <Yuion>
* @Date:   15/09/2016 12:32 PM
* @Email:  alex@yuion.net
* @Filename: btn.component.ts
* @Last modified by:   Alex Sorafumo
* @Last modified time: 27/01/2017 1:34 PM
*/

import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { trigger, transition, animate, style, state, keyframes } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { Utility } from '../../helpers';

@Component({
	selector: 'btn',
	styleUrls: [ './btn.styles.css', '../../material-styles/material-styles.css' ],
	templateUrl: './btn.template.html',
	animations : [
        trigger('clickResp', [
            //state('hide',   style({'transform':'translate(-50%, -50%) scale(0)', opacity: 0})),
            transition('void => *', animate('50ms ease-out')),
            transition('* => *', animate('0.5s ease-out', keyframes([
            	style({'transform':'translate(-50%, -50%) scale(0)', opacity: 0.5, offset: 0}),
                style({'transform':'translate(-50%, -50%) scale(1)', opacity: 0, offset: 1.0})
            ])))
        ])
    ]
})
export class Button {
		// Component Inputs
	@Input() cssClass: string = '';
	@Input() color: string = 'blue';
	@Input() primary: string = 'C500';
	@Input() secondary: string = 'C600';
	@Input() type: string = '';
	@Input() btnType: string = 'flat';
	@Input() disabled: boolean = false;
		// Output emitters
	@Output() onClick = new EventEmitter();
		// Template Elements
	@ViewChild('btnContainer') container: ElementRef;
	@ViewChild('btn') button: ElementRef;

	click_state: string = 'show';
	action_btn: boolean = false;

		//Private event observers
	private _click: any = null;
	private _mouseover: any = null;
	private _mouseout: any = null;
	private _mouseup: any = null;
	private _mousedown: any = null;

	constructor() {
	}

	ngAfterViewInit() {
		this.loadClasses();
		if(this.cssClass) {
			let classes = this.cssClass.split(' ');
			let btn = this.button.nativeElement;
			for(let i = 0; i < classes.length; i++) {
				Utility.addClass(btn, classes[i]);
			}
		}
	}
	/**
	 * Add hover CSS classes to button
	 * @return {void}
	 */
	addHover() {
		let btn = this.button.nativeElement;
		Utility.swapClass(btn, 'step-one', 'step-two');
		Utility.swapClass(btn, 'step-two', 'step-three');
		Utility.addClass(btn, 'hover');
	}

	/**
	 * Remove hover CSS classes to button
	 * @return {void}
	 */
	removeHover() {
		let btn = this.button.nativeElement;
		Utility.swapClass(btn, 'step-three', 'step-two');
		Utility.swapClass(btn, 'step-two', 'step-one');
		Utility.removeClass(btn, 'hover')
	}

	/**
	 * Add active CSS classes to button
	 * @return {void}
	 */
	addActive() {
		let btn = this.button.nativeElement;
		let simple = 'font-' + this.color + '-';
		Utility.addClass(btn, 'active');
		Utility.swapClass(btn, simple + this.primary, simple + this.secondary);
	}

	/**
	 * Remove active CSS classes to button
	 * @return {void}
	 */
	removeActive() {
		let btn = this.button.nativeElement;
		let simple = 'font-' + this.color + '-';
		Utility.removeClass(btn, 'active');
		Utility.swapClass(btn, simple + this.secondary, simple + this.primary);
	}

	ngOnChanges(changes: any) {
		if(changes.color || changes.primary || changes.secondary || changes.btnType){
			this.loadClasses();
			this.action_btn = this.btnType ? this.btnType.indexOf('action') >= 0 : false;
		}
	}

	/**
	 * Add initial classes for the button
	 * @return {void}
	 */
	private loadClasses() {
		let btn = this.button.nativeElement;
		btn.className = 'aca';
		if(!this.disabled && this.btnType !== 'flat') {
			let step = (this.btnType.indexOf('raised') >= 0 ? 'one' : 'two');
			Utility.addClass(btn, 'step-' + step);
		} else if(this.disabled) {
			return;
		}
		if(this.btnType !== 'flat' && this.cssClass === '') {
			Utility.addClass(btn, 'color');
			Utility.addClass(btn, 'bg-' + this.color + '-' + this.primary);
			Utility.addClass(btn, 'font-white');
		} else if(this.btnType !== 'flat') {
		} else if(this.btnType === 'flat') {
			Utility.addClass(btn, 'color');
			Utility.addClass(btn, 'font-' + this.color + '-' + this.primary);
		}
	}

	/**
	 * Called when the button is clicked
	 * @return {void}
	 */
	clicked() {
		if(this.disabled) return;
		this.click_state = (this.click_state === 'show' ? 'hide' : 'show');
		this.onClick.emit();
	}

}
