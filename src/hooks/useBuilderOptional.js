import { useContext } from 'react';
import { BuilderContext } from '../context/BuilderContext';

export function useBuilderOptional() {
  return useContext(BuilderContext);
}
