import pygame, math

class attacks():
    def __init__(self, image, speed = [0,0], pos = [0,0]):
        self.image = pygame.image.load(image)
