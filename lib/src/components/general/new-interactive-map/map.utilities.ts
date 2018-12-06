/*
 *  Utility functions for maps
 */

export class MapUtilities {
    constructor() {
        throw new Error('class is static')
    }

    public static base64Encode(str) {
        // first we use encodeURIComponent to get percent-encoded UTF-8,
        // then we convert the percent encodings into raw bytes which
        // can be fed into btoa.
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode(('0x' + p1) as any);
        }));
    }

    public static getFillScale(source, dest) {
        const ratio_w = source.width / dest.width;
        const ratio_h = source.height / dest.height;
        return Math.min(ratio_w, ratio_h);
    }

    public static cleanCssSelector(name) {
        let selector = name.replace(/[!"#$%&'()*+,.\/;<=>?@[\\\]^`{|}~]/g, "\\$&");
        let parts = selector.split(' ');
        console.log('Parts:', parts);
        for (let p of parts) {
            console.log('Part:', p);
            parts.splice(parts.indexOf(p), 1, [p.replace(/^\\/g, '')]);
        }
        console.log('Parts:', parts);
        selector = parts.join(' ');
        return selector;
    }
}