// Fichier de déclaration de types pour les composants

// Types pour le composant Card
declare module '../components/ui/Card' {
  import { FC, ReactNode } from 'react';

  export interface CardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
  }

  export interface CardHeaderProps {
    children: ReactNode;
    className?: string;
  }

  export interface CardBodyProps {
    children: ReactNode;
    className?: string;
  }

  export interface CardFooterProps {
    children: ReactNode;
    className?: string;
  }

  export const Card: FC<CardProps>;
  export const CardHeader: FC<CardHeaderProps>;
  export const CardBody: FC<CardBodyProps>;
  export const CardFooter: FC<CardFooterProps>;

  // Exporter les types
  export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps };
}

// Types pour le composant Button
declare module '../components/ui/Button' {
  import { ButtonHTMLAttributes, FC } from 'react';

  export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    isLoading?: boolean;
  }

  const Button: FC<ButtonProps>;
  
  export default Button;
  export type { ButtonProps, ButtonVariant };
}

// Types pour le composant Input
declare module '../components/ui/Input' {
  import { InputHTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';

  export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
  }

  const Input: ForwardRefExoticComponent<InputProps & RefAttributes<HTMLInputElement>>;
  
  export default Input;
  export type { InputProps };
}
