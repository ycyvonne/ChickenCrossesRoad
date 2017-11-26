# A Chicken Crosses the Road


To run this project: 

```
$ python -m SimpleHTTPServer
```

### Description

A chicken attempts to cross various roads. Many dangers lie in its path. Whether it be a yellow car, orange car, or even a blue car, the chicken is in grave danger of being squashed. The chicken can also drown, if it misses the lily pads when crossing the river. Only you can help the chicken cross safely.

### Technical Details

##### Camera

The `look_at` function is used to track the chicken's movement in the z-direction. Furthermore, additional complexity was added on in order to make the changes in camera motion to happen with a linear transition, instead of snapping to. Refer to `game_dependencies/Transition.js` to see how this was done.

##### Collision Detection

Various forms of collision detection were employed. The first kind is obstacles. These are trees and rocks used in regular grassy terrain. The chicken can't go through these kind of obstacles. The second kind is danger. These are the moving cars in the streets. When the chicken collides with these, the chicken is flattened and the game is over. The third kind is safety, which are lily pads in water terrain. If the chicken crosses anything BUT lily pads, the chicken will drown.

##### Component / Class Hierarchies 

Since so many graphics elements were used, and different terrains all interacting with each other and the chicken, I separated most graphics elements into the folder `game_view_components` and further in `game_view_components/terrain`. These custom elements have a `draw()` function inherit from each other and contain each other, i.e. `Grass_Strip`, `Water_Strip`, and `Street_Strip` inherit from `Ground_Strip`. `Ground` contains many `Ground_Strip` instances. `Interaction_Controller` contains instances of `Ground` as well as `Player`.

##### Hierarchal Objects

Various components such as the car are hierarchal, with the car body, then the car hood, then the car window, and the car top, as well as the car's wheels.

##### Custom Shape

The custom shape I created was a pyramid, used for rocks. You can view this under `vendor/dependencies`.
```
class Pyramid extends Shape {
	/* custom code */
}
```

##### Textures

Custom textures were added onto trees, rocks, and water. 

##### Procedural Generation

Many things are randomely / procedurally generated in this game. The positions of trees, the height of trees, the texture of the tree (from a selection of 4 textures), are all randomely generated. The position of rocks, as well as the position of lily pads are randomely generated.

For cars, the speed, color, and direction are also random. 


