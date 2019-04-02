# sim2d
Extends a WebGL context to include some convenient methods of a 2D Canvas.
The first methods to be included:
- .drawImage()
- .clearRect()

## Use cases
Modules built on the 2D Canvas API should be able to use a WebGL context
instead, if it is first wrapped with sim2d. This should allow graphics output
of the 2D-based module to be used in a larger 3D WebGL application, without
the overhead / delay of copying a 2D canvas as an image.
