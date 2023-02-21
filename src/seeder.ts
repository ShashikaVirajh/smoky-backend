/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from '@faker-js/faker';
import axios from 'axios';
import { createCanvas } from 'canvas';
import dotenv from 'dotenv';
import { floor, random } from 'lodash';

dotenv.config({});

function avatarColor(): string {
  const colors: string[] = [
    '#f44336',
    '#e91e63',
    '#2196f3',
    '#9c27b0',
    '#3f51b5',
    '#00bcd4',
    '#4caf50',
    '#ff9800',
    '#8bc34a',
    '#009688',
    '#03a9f4',
    '#cddc39',
    '#2962ff',
    '#448aff',
    '#84ffff',
    '#00e676',
    '#43a047',
    '#d32f2f',
    '#ff1744',
    '#ad1457',
    '#6a1b9a',
    '#1a237e',
    '#1de9b6',
    '#d84315'
  ];

  return colors[floor(random(0.9) * colors.length)];
}

function generateAvatar(text: string, backgroundColor: string, foregroundColor = 'white') {
  const canvas = createCanvas(200, 200);
  const context = canvas.getContext('2d');

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = 'normal 80px sans-serif';
  context.fillStyle = foregroundColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL('image/png');
}

async function seedUserData(count: number): Promise<void> {
  try {
    console.log('Started seeding to auth table...');

    for (let i = 0; i < count; i++) {
      const username: string = faker.helpers.unique(faker.word.adjective, [8]);
      const color = avatarColor();
      const avatar = generateAvatar(username.charAt(0).toUpperCase(), color);

      const userData = {
        username,
        email: faker.internet.email(),
        password: 'pass1234',
        avatarColor: color,
        avatarImage: avatar
      };

      await axios.post(`${process.env.API_URL}/api/v1/auth/sign-up`, userData);
    }

    console.log('Finished seeding to auth table...');
  } catch (error: any) {
    console.error(error?.message || error?.response?.data);
  }
}

seedUserData(10);
