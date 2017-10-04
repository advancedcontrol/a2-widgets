
import { Component, ElementRef, Input, Type, ViewChild } from '@angular/core';
import { ComponentFactoryResolver, Renderer2, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { WIDGETS } from '../../settings';

@Component({
    selector: 'dynamic-base',
    template: '',
    styles: [''],
})
export class DynamicBaseComponent {
    @Input() public id: string = '';
    @Input() public model: any = {};
    @Input() public cmp_ref: any = null;
    @Input() public parent: any = null;
    @Input() public state: any = { obs: null, sub: null };
    @Input() public rendered: boolean = false;

    @ViewChild('content', { read: ViewContainerRef }) private _content: ViewContainerRef;
    @ViewChild('body') protected body: ElementRef;

    constructor(private _cfr: ComponentFactoryResolver, public renderer: Renderer2) {
    }
    public ngOnInit() {
        this.state.sub = new Observable((observer: any) => {
            this.state.obs = observer;
        });
    }

    public init(parent?: any, id?: string) {
        this.parent = parent || this.parent;
        this.id = id || this.id;
    }

    public ngOnDestroy() {
        if (this.cmp_ref) {
            this.cmp_ref.destroy();
            this.cmp_ref = null;
        }
    }

    public tap() {
        this.model.tapped = true;
        setTimeout(() => {
            this.model.tapped = false;
        }, 100);
    }

    public close(e?: any) {
        if (e && this.body && this.body.nativeElement) {
            const c = { x: e.clientX, y: e.clientY };
            const box = this.body.nativeElement.getBoundingClientRect();
            if (c.x >= box.left && c.y >= box.top && c.x <= box.left + box.width && c.y <= box.top + box.height) {
                this.model.tapped = true;
                setTimeout(() => {
                    this.model.tapped = false;
                }, 100);
            }
        }
        setTimeout(() => {
            if (!this.model.tapped) {
                this.model.show = false;
                this.event('close');
            }
        }, 20);
    }
    /**
     * Posts an event to the Observable.
     * @param  {string}    type Type of event that has occured
     * @param  {string =    'Code'}    location Location that the event has come from
     * @return {void}
     */
    public event(type: string, location: string = 'Code') {
        if (this.cmp_ref) {
            this.model.data = this.cmp_ref.instance.model;
        }
        if (this.state.obs) {
            this.state.obs.next({
                type,
                location,
                data: this.model.data,
                update: (form: any) => { this.set({ data: form }); },
                close: () => { this.parent.remove(this.id); },
            });
        } else {
            WIDGETS.error('DYN_CMP', `Event observable was deleted before overlay's event could occur.`);
            this.remove();
        }
    }

    public subscribe(next: () => void, error?: () => void, complete?: () => void) {
        return this.watch(next, error, complete);
    }

    public watch(next: () => void, error?: () => void, complete?: () => void) {
        if (this.state.sub) {
            return this.state.sub.subscribe(next, error, complete);
        } else {
            return null;
        }
    }

    public set(data: any) {
        this.update(data);
    }

    protected update(data: any) {
        console.log(data);
        const cmp = this.model.cmp;
        for (const f in data) {
            if (data.hasOwnProperty(f)) {
                this.model[f] = data[f];
            }
        }
        if (cmp !== this.model.cmp) {
            this.render();
        } else {
            this.updateComponent(data);
        }
    }

    protected updateComponent(data: any, tries: number = 0) {
        if (this.cmp_ref){
            this.cmp_ref.instance.set(data);
        } else {
            tries++;
            setTimeout(() => {
                this.updateComponent(data, tries);
            }, 200 * tries);
        }
    }

    protected remove() {
        if (this.parent) {
            this.parent.remove(this.id);
        }
    }

    /**
     * Resolves the factory, then creates the content component
     * @return {void}
     */
    private render() {
        if (!this._cfr || !this._content) {
            setTimeout(() => {
                this.render();
            }, 200);
            return;
        }
        if (this.model.cmp !== undefined && this.model.cmp !== null) {
            setTimeout(() => {
                const factory = this._cfr.resolveComponentFactory(this.model.cmp);
                if (factory) {
                    if (this.cmp_ref) {
                        this.cmp_ref.destroy();
                        this.rendered = false;
                    }
                    this.cmp_ref = this._content.createComponent(factory);

                    // Inject data into component instance
                    const inst = this.cmp_ref.instance;
                    inst.set(this.model.data);
                    inst.parent = this;
                    if (!inst.model) {
                        inst.model = {};
                    }
                    if (!inst.fn) {
                        inst.fn = {};
                    }
                    inst.fn.close = (cb: () => void) => { this.event('close', 'Component'); };
                    inst.fn.event = (option: string) => { this.event(option, 'Component'); };
                    if (inst.init) {
                        inst.init();
                    }
                    setTimeout(() => {
                        this.rendered = true;
                    }, 100);
                } else {
                    WIDGETS.error('DYN_CMP', 'Unable to find factory for: ', this.model.cmp);
                }
            }, 10);
        }
    }
}