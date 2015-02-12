from Ball import Ball

class Spike(Ball):
    def __init__(self, owner, direction):
        if direction == "right":
            speed = [3,0]
        elif direction == "left":
            speed = [-3,0]
        elif direction == "up":
            speed = [0,-3]
        elif direction == "down":
            speed = [0,3]
        Ball.__init__(self, "puffer fish\puffer fish spike.png", speed, owner.rect.center)

    def collideWall(self, width, height):
        if not self.didBounceX:
            #print "trying to hit Wall"
            if self.rect.left < 0 or self.rect.right > width:
                self.living = False
                #print "hit xWall"
        if not self.didBounceY:
            if self.rect.top < 0 or self.rect.bottom > height:
                self.living = False
                #print "hit xWall"
