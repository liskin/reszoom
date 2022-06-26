# reszoom

**Chrome extension to automatically adjust page zoom settings based on screen resolution**

(this is my Manifest V3 fork of <https://github.com/raboof/reszoom>)

~~Available via the [Chrome Webstore](https://chrome.google.com/webstore/detail/resolution-zoom/enjjhajnmggdgofagbokhmifgnaophmh)~~

Currently, it will decide between 'high-resolution' and 'low-resolution' by checking if the screen is wider or taller than 2800 pixels. If so, pages at zoom levels 100% or 150% will be automatically set to 100% for regular-DPI screens, and 150% for high-DPI screens.

![Overview](overview.png)

## Background

HiDPI (High Dots Per Inch, also called 'Retina') displays are a joy to use,
and becoming more and more popular both in laptops and external displays. They
are not (yet), however, ubiquitous, so you might find yourself mixing HiDPI
and 'regular' screens.

This introduces an interesting challenge: if you would move a bitmap from one
screen to another without adjustment, it would look huge on the low-DPI
screen compared to the HiDPI screen. This is especially problematic for fonts.

Rendering fonts beautifully is a difficult problem, and the algorithms that
do this are sophisticated pieces of engineering. You cannot get away with
simply rendering a text at high resolution, and then generically 'scaling'
that bitmap down to a size sitable for a low-resolution screen: it would
simply look ugly.

This means applications must be aware of the DPI of the screen they're on, and
render large or small accordingly. I'm not sure about the situation on Windows
or Mac, but on Linux (especially X11) AFAICS there is no good infrastructure
for this in place yet.

This Chrome extension zooms pages to 150% or 100% based on whether you're on
a HiDPI or 'regular' screen, making sure Chrome renders the fonts at a
suitable size.

## Credits

The original Manifest V2 extension was created and used to be maintained by [Arnout Engelen](https://github.com/raboof).
The logo contains icons from the [eclectic-outline collection on the Noun project](https://thenounproject.com/serkan/collection/eclectic-outline-icons) by Serkan Doğan.
