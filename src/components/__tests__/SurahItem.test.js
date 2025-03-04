import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import SurahItem from '../SurahItem';

const mockStore = configureMockStore();

describe('SurahItem Component', () => {
  const surah = {
    id: 1,
    name_simple: 'Al-Fatihah',
    name_arabic: 'الفاتحة',
    verses_count: 7,
  };

  it('renders correctly', () => {
    const store = mockStore({
      settings: { theme: 'light' },
    });

    const { getByText } = render(
      <Provider store={store}>
        <SurahItem surah={surah} onPress={() => {}} />
      </Provider>
    );

    expect(getByText('Al-Fatihah')).toBeDefined();
    expect(getByText('الفاتحة')).toBeDefined();
    expect(getByText('7 verses')).toBeDefined();
  });

  it('calls onPress when pressed', () => {
    const store = mockStore({
      settings: { theme: 'light' },
    });
    const onPressMock = jest.fn();

    const { getByTestId } = render(
      <Provider store={store}>
        <SurahItem surah={surah} onPress={onPressMock} testID="surah-item" />
      </Provider>
    );

    fireEvent.press(getByTestId('surah-item'));
    expect(onPressMock).toHaveBeenCalledWith(surah.id, surah.name_simple);
  });
});