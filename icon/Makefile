.PHONY: all
all: icon128.png icon48.png icon32.png icon16.png

icon128.png: icon.xcf
	convert icon.xcf icon128.png

icon48.png: icon.xcf
	convert icon.xcf -scale 48x48 icon48.png

icon32.png: icon.xcf
	convert icon.xcf -scale 32x32 icon32.png

icon16.png: icon.xcf
	convert icon.xcf -scale 16x16 icon16.png

