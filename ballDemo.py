import pygame, sys, random
from Ball import Ball
from PlayerBall import PlayerBall
from HUD import Text
from HUD import Score
from Button import Button

pygame.init()

clock = pygame.time.Clock()

width = 800 
height = 600
size = width, height

bgColor = r,g,b = 0, 0, 0

screen = pygame.display.set_mode(size)

bgImage = pygame.image.load("images/Screens/Start Screen.png").convert()
bgRect = bgImage.get_rect()

player = PlayerBall([width/2, height/2])

balls = []
balls += [Ball("images/Ball/ball.png", [4,5], [100, 125])]

timer = Score([80, height - 25], "Time: ", 36)
timerWait = 0
timerWaitMax = 6

score = Score([width-80, height-25], "Score: ", 36)

run = False

startButton = Button([width/2, height-300], 
				     "images/Buttons/Start Base.png", 
				     "images/Buttons/Start Clicked.png")

while True:
	while not run:
		for event in pygame.event.get():
			if event.type == pygame.QUIT: sys.exit()
			if event.type == pygame.KEYDOWN:
				if event.key == pygame.K_RETURN:
					run = True
			if event.type == pygame.MOUSEBUTTONDOWN:
				startButton.click(event.pos)
			if event.type == pygame.MOUSEBUTTONUP:
				if startButton.release(event.pos):
					run = True
					
		bgColor = r,g,b
		screen.fill(bgColor)
		screen.blit(bgImage, bgRect)
		screen.blit(startButton.image, startButton.rect)
		pygame.display.flip()
		clock.tick(60)
		
	bgImage = pygame.image.load("images/Screens/Main Screen.png").convert()
	bgRect = bgImage.get_rect()
	while run:
		for event in pygame.event.get():
			if event.type == pygame.QUIT: sys.exit()
			if event.type == pygame.KEYDOWN:
				if event.key == pygame.K_w or event.key == pygame.K_UP:
					player.go("up")
				if event.key == pygame.K_d or event.key == pygame.K_RIGHT:
					player.go("right")
				if event.key == pygame.K_s or event.key == pygame.K_DOWN:
					player.go("down")
				if event.key == pygame.K_a or event.key == pygame.K_LEFT:
					player.go("left")
			if event.type == pygame.KEYUP:
				if event.key == pygame.K_w or event.key == pygame.K_UP:
					player.go("stop up")
				if event.key == pygame.K_d or event.key == pygame.K_RIGHT:
					player.go("stop right")
				if event.key == pygame.K_s or event.key == pygame.K_DOWN:
					player.go("stop down")
				if event.key == pygame.K_a or event.key == pygame.K_LEFT:
					player.go("stop left")
			
		if len(balls) < 10:
			if random.randint(0, 1*60) == 0:
				balls += [Ball("images/Ball/ball.png",
						  [random.randint(0,10), random.randint(0,10)],
						  [random.randint(100, width-100), random.randint(100, height-100)])
						  ]
						  
		if timerWait < timerWaitMax:
			timerWait += 1
		else:
			timerWait = 0
			timer.increaseScore(.1)
		player.update(width, height)
		timer.update()
		score.update()
		for ball in balls:
			ball.update(width, height)
			
		for bully in balls:
			for victem in balls:
				bully.collideBall(victem)
			if bully.collidePlayer(player):
				score.increaseScore(1)
		
		for ball in balls:
			if not ball.living:
				balls.remove(ball)
		
		bgColor = r,g,b
		screen.fill(bgColor)
		screen.blit(bgImage, bgRect)
		for ball in balls:
			screen.blit(ball.image, ball.rect)
		screen.blit(player.image, player.rect)
		screen.blit(timer.image, timer.rect)
		screen.blit(score.image, score.rect)
		pygame.display.flip()
		clock.tick(60)
		
		
		
		
		
		
		
		
		
		
		
		
		
		
