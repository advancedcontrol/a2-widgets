/**
* @Author: Alex Sorafumo
* @Date:   18/11/2016 4:31 PM
* @Email:  alex@yuion.net
* @Filename: modal.service.ts
* @Last modified by:   Alex Sorafumo
* @Last modified time: 27/01/2017 1:14 PM
*/

import { Injectable, ComponentFactoryResolver, ComponentRef, ViewContainerRef, Type, Injector } from '@angular/core';
import { ApplicationRef } from '@angular/core';
import { Modal } from '../components/modal';
import { AlertDialog, ConfirmDialog, DateDialog, TimeDialog } from '../components';
import { SimpleModal } from '../components/modal/modals';

let Modals: any = {

}

@Injectable()
export class ModalService {

  	modal: any = {};
  	modalRef: any = {};
  	colors: { fg: string, bg: string } = {
  		fg: '#FFF',
  		bg: '#123456'
  	};
  	modal_data: any = {};
  	modal_inputs: any = {};
  	last_modal_id: string = '';
	private default_vc: ViewContainerRef = null;
  	private _view: ViewContainerRef = null;
	private tries: number = 0;

	constructor(private _cr: ComponentFactoryResolver, private injector: Injector) {
		this.loadView();
		Modals = {
			default: Modal,
			simple: SimpleModal,
			alert: AlertDialog,
			confirm: ConfirmDialog,
			date: DateDialog,
			time: TimeDialog
			//*/
		}
	}

	ngOnInit() {

	}

    /**
     * Sets the view to attach the notification display, usually the root component
     * @param  {ViewContainerRef} view View Container to attach the notifications display
     * @return {void}
     */
	set view(view: ViewContainerRef) {
		if(view){
			this._view = view;
		} else {

		}
	}

    /**
     * Attempts to load the root view container
     * @return {void}
     */
	loadView() {
        let app_ref = <ApplicationRef>this.injector.get(ApplicationRef);
		if(app_ref && app_ref['_rootComponents'] && app_ref['_rootComponents'][0] && app_ref['_rootComponents'][0]['_hostElement']){
			this.default_vc = app_ref['_rootComponents'][0]['_hostElement'].vcRef;
            if(this.default_vc) {
                this._view = this.default_vc;
			}
		} else if(this.tries < 10) {
            this.tries++;
			setTimeout(() => {
				this.loadView();
			}, 500);
		}
	}
    /**
     * Stores paramters for use when creating a modal with the given id
     * @param  {string} id    Modal ID
     * @param  {any}    input Modal creation parameters
     * @return {void}
     */
	setup(id:string, input:any) {
		this.modal_inputs[id] = input;
	}

    /**
     * Opens a modal of id with the given or previously stored parameters
     * @param  {string} id    Modal ID, if not set or empty will create random id
     * @param  {any}    input (Optional) Modal Creation parameters
     * @return {string}       Returns the id of the modal
     */
	open(id:string, input?:any) {
		if(!id || id === '') id = Math.floor(Math.random() * 89999999 + 10000000).toString();
		if(!input) {
				// Check if previous modal data exists
			let info = this.modal_inputs[id];
			if(info && (info.component || info.html)) {
				if(this.modal[id]) this.cleanModal(id);
				this.modal_data[id] = info;
					// Create Modal
				let modal = this.render(id, this.modal_data[id].type);
				this.last_modal_id = id;
				return id;
			} else  {
				if(window['debug']) console.error('[WIDGETS][Modal(S)] No inputs for modal.');
				return id;
			}
		}
		if(this.modal[id]) this.cleanModal(id);
			// Get any previously set properties
		if(this.modal_inputs[id]) this.modal_data[id] = this.modal_inputs[id];
		else this.modal_data[id] = {};
			//Update parameters
		this.modal_data[id] = {
			type: Modals[input.type] ? Modals[input.type] : (this.modal_data[id].type ? this.modal_data[id].type : Modals.default),
			title: input.title ? input.title : this.modal_data[id].title,
			data: input.data ? input.data : this.modal_data[id].data,
			html: input.html ? input.html : this.modal_data[id].html,
			component: input.component ? input.component : ( input.cmp ? input.cmp : this.modal_data[id].component),
			text: input.text ? input.text : this.modal_data[id].text,
			size: input.size ? input.size : this.modal_data[id].size,
			styles: input.styles ? input.styles : this.modal_data[id].styles,
			options: input.options ? input.options : this.modal_data[id].options,
			width: input.width ? input.width : this.modal_data[id].width,
			top: input.top ? input.top : this.modal_data[id].top,
			close: input.close ? input.close : this.modal_data[id].close,
			colors : input.colors ? input.colors : (this.modal_data[id].colors ? this.modal_data[id].colors : this.colors)
		};
		if(typeof this.modal_data[id].type === 'string') {
			this.modal_data[id].type = Modals[this.modal_data[id].type] || Modals.default;
		}
		this.modal_inputs[id] = this.modal_data[id];
			// Create Modal
		let modal = this.render(id, this.modal_inputs[id].type);
		this.last_modal_id = id;
		return modal.status;
	}

    /**
     * Close modal with the given id or all modals
     * @param  {string} id (Optional)Modal ID
     * @return {void}
     */
	close(id:string) {
		if(id === '' && this.last_modal_id === '') {
				// Close all modals
			let keys = Object.keys(this.modal);
			for(let i = 0; i < keys.length; i++) {
				if(this.modal[keys[i]]) {
					this.modal[id].close();
					this.cleanModal(id);
				}
			}
		} else if(id === '' && this.last_modal_id !== '') {
				//Close last modals
			this.modal[id].close();
			this.last_modal_id = '';
		} else if(id && this.modal[id]) {
				//Close selected modal
			this.modal[id].close();
			this.cleanModal(id);
		}
	}
    /**
     * Closes all modal
     * @return {void}
     */
	clear() {
		let keys = Object.keys(this.modal);
		for(let i = 0; i < keys.length; i++) {
            if(this.modal[keys[i]]){
    			this.modal[keys[i]].close();
    			this.cleanModal(keys[i]);
            }
		}
	}
    /**
     * Cleans up modal after it has been removed.
     * @param  {string} id Modal ID
     * @return {void}
     */
	private cleanModal(id:string) {
		if(this.modalRef[id]) {

				// Destory Modal
			this.modalRef[id].destroy();
		}
		this.modalRef[id] = null;
		this.modal[id] = null;
		this.modal_data[id] = null;
	}
    /**
     * Render modal inside defined view container
     * @param  {string}    id   Modal ID
     * @param  {Type<any>} type Modal Component
     * @return {any} Returns the instance of the modal
     */
    private render(id:string, type: Type<any>){
    	if(this._view && type && typeof type !== 'string') {
	        let factory = this._cr.resolveComponentFactory(type)
			if(this.modalRef[id]) {
				this.modalRef[id].destroy();
			}
	    	this.modalRef[id] = this._view.createComponent(factory);

	        // let's inject @Inputs to component instance
	        this.modal[id] = this.modalRef[id].instance;
			this.modal[id].id = id;
			this.modal[id].service = this;
	        this.modal[id].setParams(this.modal_data[id]);
        	return this.modal[id];
        } else if(!this._view) {
			this._view = this.default_vc;
			if(this.default_vc) {
				this.render(id, type);
			}
		}
    }

}
