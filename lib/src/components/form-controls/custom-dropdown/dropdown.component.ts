
import { Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';

import { CustomDropdownListComponent } from './custom-dropdown-list/dropdown-list.component';

@Component({
    selector: 'custom-dropdown',
    templateUrl: './dropdown.template.html',
    styleUrls: ['./dropdown.styles.scss'],
})
export class CustomDropdownComponent {
    @Input() public name = '';
    @Input() public list: any[] = [];
    @Input() public model = 0;
    @Input() public filter = false;
    @Input() public placeholder = '';
    @Input() public hideActive = false;
    @Input() public template: TemplateRef<any>;
    @Input() public html = '';
    @Output() public modelChange: any = new EventEmitter();

    @ViewChild('body') private body: ElementRef;
    @ViewChild('active') private active: ElementRef;

    public id: any = {};
    public data: any = {};
    public show = false;
    public cmp: any = CustomDropdownListComponent;
    public width = 200;
    public list_items: any[] = [];
    public bottom = false;

    constructor() {
        this.id = `DD${Math.floor(Math.random() * 89999999 + 10000000).toString()}`;
    }

    public ngAfterViewInit() {
    }

    public ngOnChanges(changes: any) {
        if (changes.list) {
            this.processList();
        }
        this.update();
        setTimeout(() => {
            this.resize();
        }, 300);
    }

    public select(e: any) {
        if (e.type === 'Select') {
            this.model = e.data.active;
            this.modelChange.emit(this.model);
            e.close();
            this.show = false;
            this.update();
        }
    }

    public updateSize(tries: number = 0) {
        if (tries > 10) {
            return;
        }
        if (this.body && this.body.nativeElement) {
            this.width = this.body.nativeElement.offsetWidth;
            this.update();
        } else {
            tries++;
            setTimeout(() => {
                this.updateSize(tries);
            }, 200);
        }
    }

    public resize() {
        this.updateSize();
        if (this.active && this.active.nativeElement) {
            const box = this.active.nativeElement.getBoundingClientRect();
            const top = box.top + box.height / 2;
            const height = window.innerHeight || document.body.clientHeight;
            this.bottom = top > height / 2;
            this.update();
        }
    }

    private update() {
        this.data = {
            name: this.name + (this.bottom ? ' bottom' : ''),
            bottom: this.bottom,
            list: this.list_items,
            active: this.model,
            filter: this.filter,
            width: this.width,
            hideActive: this.hideActive,
            placeholder: this.placeholder,
            template: this.template,
        };
    }

    private processList() {
        if (this.list) {
            const list: any[] = [];
            for (const item of this.list) {
                if (typeof item === 'object') {
                    list.push(item || { name: '' });
                } else {
                    list.push({ name: item });
                }
            }
            this.list_items = list;
        }
        this.update();
    }

}
