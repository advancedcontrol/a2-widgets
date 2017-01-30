/**
* @Author: Alex Sorafumo <Yuion>
* @Date:   28/10/2016 11:24 AM
* @Email:  alex@yuion.net
* @Filename: virtual-keyboard.directive.ts
* @Last modified by:   Alex Sorafumo
* @Last modified time: 27/01/2017 1:28 PM
*/

import { Directive, Input, Output, EventEmitter } from '@angular/core';
import { ComponentFactoryResolver, ComponentRef, ViewContainerRef, Type } from '@angular/core';
import { ApplicationRef } from '@angular/core';
import { VirtualKeyboard } from '../components';

@Directive({
	selector: '[virtual-keyboard]'
})
export class VirtualKeyboardDirective {
    @Input() model: string = '';
    @Input() active: boolean = true;
    @Input() type: string = 'QWERTY';
    @Input() layout: string = 'standard';
    @Output() modelChange = new EventEmitter();
    @Output() activeChange = new EventEmitter();

	view: ViewContainerRef;
  	cmp: any = null;
  	cmpRef: ComponentRef<any> = null;

	constructor(private _cr: ComponentFactoryResolver, private app_ref: ApplicationRef) {
		this.view = app_ref['_rootComponents'][0]['_hostElement'].vcRef;
	}

	ngOnInit() {
        this.render(VirtualKeyboard);
	}

    ngOnChanges(changes: any) {
        this.update();
    }

	ngOnDestory() {
		if(window['debug']) console.debug('[WIDGETS][Keyboard(D)] Closed virtual keyboard');
		if(this.cmp){
			this.cmp.close();
			setTimeout(() => {
				if(this.cmpRef) {
					this.cmpRef.destroy();
				}
			}, 500);
		}
	}
	/**
	 * Render virtual keyboard on the root component
	 * @param  {Type<any>} type Component to render
	 * @return {void}
	 */
    private render(type: Type<any>){
    	if(this.view) {
	        let factory = this._cr.resolveComponentFactory(type);
			if(this.cmpRef) {
				this.cmpRef.destroy();
			}
	    	this.cmpRef = this.view.createComponent(factory);

	        // let's inject @Inputs to component instance
	        this.cmp = this.cmpRef.instance;
			this.cmp.activeChange.subscribe(
				(data:any) => {
					this.active = data; this.activeChange.emit(data);
				}, (err:any) => {},
				() => {}
			)
            this.update();
        }
    }
	/**
	 * Update keyboard display
	 * @return {void}
	 */
    private update() {
        if(this.cmp) {
            this.cmp.model = this.model;
            this.cmp.type = this.type;
            this.cmp.layout = this.layout;
            this.cmp.modelChange = this.modelChange;
            this.cmp.loadLayout();
			if(this.active !== this.cmp.active){
				if(this.active) {
					this.cmp.open();
				} else if (!this.active) {
					this.cmp.close();
				}
			}
        }
    }
}
