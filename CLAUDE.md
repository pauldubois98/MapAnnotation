I want to create a tool to enable the user to anotate a map.
The user can define a region, a point, or a ptah, and add a description.
When finished, the anotation can be downloaded as JSON.
Then, another user can uplaod json annotations, and browse the map.
The interface should be pure and modern.
I want to use pure JS/HTML/CSS.
Plan before coding, ask if anything is unclear or if you see multiple implementation paths.

Add a readme (including instructions to run locally).

I want the user to be able to type the name of a city, and the tool will automatically zoom on that city.

I want the user to have the option to show plan view, or satellite (with or without roads, etc).
Give as many options as possible.
Plan before coding, ask if anython is unclear.

Fix these warnings I get in the console:
- wrong event specified: touchleave
- MouseEvent.mozPressure is deprecated. Use PointerEvent.pressure instead.
- MouseEvent.mozInputSource is deprecated. Use PointerEvent.pointerType instead.

The user should be able to pick the color associated with each marker.
Default to red.
Also allow circular region selection.

Allow the user to copy/paste the geojson (as well as file download/upload).
