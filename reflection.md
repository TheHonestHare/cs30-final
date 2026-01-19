# Reflection

## What advice would you give to yourself if you were to do it again?
- make a less ambitious needs-to-have and put more in nice-to-have
- don't focus for like a month on making a really nice smoothing camera because in the end that won't make or break the project
- read other platformer physics code rather than trying to roll my own the whole time
## Did you complete everything in your needs to have list?
No, but I ended up making a lot of other things instead that were not planned. For example, even though I didn't get to making 10 levels, I made the level editor far more featureful than I had originally planned, so level creation is ridiculously fast now. Even though I didn't get to making 3 abilities, the 2 I did make were incredibly polished and feel very good to use together.
## What was the hardest part of the project?
Getting the pixel art style to work. It is done by drawing to a lower resolution framebuffer, then upscaling it to the final canvas size. However, p5js isn't really meant to do this, and I faced many issues like having to disable smoothing in the p5js code itself when it draws an image, and having to come up with the math for the camera offsets both before AND after upscaling (since stuff like the selector animation needed to be done on the final canvas). I could have used noSmooth(), but my way is more flexible and allows later effects like pixelated particle effects