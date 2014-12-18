import pygame
from Ball import Ball

class PlayerBall(Ball):
	def __init__(self, pos):
		Ball.__init__(self, "images/Player/pballbu.png", [0,0], pos)
		self.upImages = [pygame.image.load("images/Player/pballru.png"),
						 pygame.image.load("images/Player/pballgu.png"),
						 pygame.image.load("images/Player/pballbu.png")]
		self.downImages = [pygame.image.load("images/Player/pballrd.png"),
						   pygame.image.load("images/Player/pballgd.png"),
						   pygame.image.load("images/Player/pballbd.png")]
		self.leftImages = [pygame.image.load("images/Player/pballrl.png"),
						   pygame.image.load("images/Player/pballgl.png"),
						   pygame.image.load("images/Player/pballbl.png")]
		self.rightImages = [pygame.image.load("images/Player/pballrr.png"),
						    pygame.image.load("images/Player/pballgr.png"),
						    pygame.image.load("images/Player/pballbr.png")]
		self.facing = "up"
		self.changed = False
		self.images = self.upImages
		self.frame = 0
		self.maxFrame = len(self.images) - 1
		self.waitCount = 0
		self.maxWait = 60*.25
		self.image = self.images[self.frame]
		self.rect = self.image.get_rect(center = self.rect.center)
		self.maxSpeed = 10
			
	def update(self, width, height):
		Ball.update(self, width, height)
		self.animate()
		self.changed = False
		
	def collideWall(self, width, height):
		if not self.didBounceX:
			#print "trying to hit Wall"
			if self.rect.left < 0 or self.rect.right > width:
				self.speedx = 0
				self.didBounceX = True
				#print "hit xWall"
		if not self.didBounceY:
			if self.rect.top < 0 or self.rect.bottom > height:
				self.speedy = 0
				self.didBounceY = True
				#print "hit xWall"
	
	def animate(self):
		if self.waitCount < self.maxWait:
			self.waitCount += 1
		else:
			self.waitCount = 0
			self.changed = True
			if self.frame < self.maxFrame:
				self.frame += 1
			else:
				self.frame = 0
		
		if self.changed:	
			if self.facing == "up":
				self.images = self.upImages
			elif self.facing == "down":
				self.images = self.downImages
			elif self.facing == "right":
				self.images = self.rightImages
			elif self.facing == "left":
				self.images = self.leftImages
			
			self.image = self.images[self.frame]
	
	def go(self, direction):
		if direction == "up":
			self.facing = "up"
			self.changed = True
			self.speedy = -self.maxSpeed
		elif direction == "stop up":
			self.speedy = 0
		elif direction == "down":
			self.facing = "down"
			self.changed = True
			self.speedy = self.maxSpeed
		elif direction == "stop down":
			self.speedy = 0
			
		if direction == "right":
			self.facing = "right"
			self.changed = True
			self.speedx = self.maxSpeed
		elif direction == "stop right":
			self.speedx = 0
		elif direction == "left":
			self.facing = "left"
			self.changed = True
			self.speedx = -self.maxSpeed
		elif direction == "stop left":
			self.speedx = 0




