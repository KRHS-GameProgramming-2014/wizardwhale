import pygame, sys, random
from Ball import Ball
from Player import Whale
from HUD import Text
from HUD import Score
from Button import Button
from Wall import Wall
from PufferFish import PufferFish
from Cloud import Cloud




pygame.init()

clock = pygame.time.Clock()

width = 800 
height = 600
size = width, height

bgColor = r,g,b = 0, 0, 0

screen = pygame.display.set_mode(size)

bgImage = pygame.image.load("images/Screens/Start Screen 3.png").convert()
bgRect = bgImage.get_rect()

player = Whale([width/2, height/2])

balls = []

projectiles = []

timer = Score([80, height - 25], "Time: ", 36)
timerWait = 0
timerWaitMax = 20

score = Score([width-80, height-25], "Score: ", 36)

run = False

startButton = Button([width/2, height-180], 
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
        
    bgImage = pygame.image.load("Arena/arena 3 v2.png").convert()
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
            if random.randint(0, 1*150) == 0:
                balls += [PufferFish(
                          [random.randint(0,10), random.randint(0,10)],
                          [random.randint(100, width-100), random.randint(100, height-100)])
                          ]
                          
        if timerWait < timerWaitMax:
            timerWait += 1
            
        if len(balls) < 10:
            if random.randint(0, 1*150) == 0:
                balls += [Ball("jelly fish/jelly fish.png",
                          [random.randint(0,10), random.randint(0,10)],
                          [random.randint(100, width-100), random.randint(100, height-100)])
                          ]
                    
        if timerWait < timerWaitMax:
            timerWait += 5
            
        if len(balls) < 10:
            if random.randint(0, 1*150) == 0:
                balls += [Ball("shark/shark.png",
                          [random.randint(0,10), random.randint(0,10)],
                          [random.randint(100, width-100), random.randint(100, height-100)])
                          ]
                    
        if timerWait < timerWaitMax:
            timerWait += 10
            
        else:
            timerWait = 0
            timer.increaseScore(.1)
        player.update(width, height)
        timer.update()
        score.update()
        for ball in balls:
            if ball.kind == "Puffer Fish":
                projectiles += ball.update(width, height, player)
            else:
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
        for projectile in projectiles:
            screen.blit(projectile.image,projectile.rect)
            projectile.update(width, height)
        for ball in balls:
            screen.blit(ball.image, ball.rect)
        screen.blit(player.image, player.rect)
        screen.blit(timer.image, timer.rect)
        screen.blit(score.image, score.rect)
        pygame.display.flip()
        clock.tick(60)
        
        
        
        
        
