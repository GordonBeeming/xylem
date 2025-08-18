import { genPageMetadata } from '../seo'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import ColorSwatch from './ColorSwatch'

export const metadata = genPageMetadata({ title: 'Color Palette' })

export default function ColorPalettePage() {
  const lightModeColors = [
    {
      name: 'Background',
      hex: '#F8F9FA',
      colorVar: '--color-gray-50',
      description: 'Main page background color'
    },
    {
      name: 'Text',
      hex: '#1A1A1A',
      colorVar: '--color-gray-900',
      description: 'Primary text color'
    },
    {
      name: 'Primary',
      hex: '#0063B2',
      colorVar: '--color-primary-800',
      description: 'Primary brand color for links and accents'
    },
    {
      name: 'Accent',
      hex: '#46CBFF',
      colorVar: '--color-primary-400',
      description: 'Light blue accent color'
    },
    {
      name: 'UI Accents',
      hex: '#E9ECEF',
      colorVar: '--color-gray-100',
      description: 'Borders, subtle backgrounds'
    }
  ]

  const darkModeColors = [
    {
      name: 'Background',
      hex: '#1A1A1A',
      colorVar: '--color-gray-900',
      description: 'Main page background color'
    },
    {
      name: 'Text',
      hex: '#E0E0E0',
      colorVar: '--color-gray-200',
      description: 'Primary text color'
    },
    {
      name: 'Primary',
      hex: '#46CBFF',
      colorVar: '--color-primary-400',
      description: 'Primary brand color for links and accents'
    },
    {
      name: 'Accent',
      hex: '#0063B2',
      colorVar: '--color-primary-800',
      description: 'Dark blue accent color'
    },
    {
      name: 'UI Accents',
      hex: '#2C2C2C',
      colorVar: '--color-gray-800',
      description: 'Borders, subtle backgrounds'
    }
  ]

  return (
    <SectionContainer>
      <div className="space-y-8 py-8 md:py-12">
        <div>
          <PageTitle>My Color Palette</PageTitle>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            The official brand colors for my blog, available in both light and dark mode variants.
          </p>
        </div>

        {/* Light Mode Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Light Mode
          </h2>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {lightModeColors.map((color) => (
              <ColorSwatch
                key={`light-${color.name}`}
                name={color.name}
                hex={color.hex}
                colorVar={color.colorVar}
                description={color.description}
              />
            ))}
          </div>
        </div>

        {/* Dark Mode Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Dark Mode
          </h2>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {darkModeColors.map((color) => (
              <ColorSwatch
                key={`dark-${color.name}`}
                name={color.name}
                hex={color.hex}
                colorVar={color.colorVar}
                description={color.description}
              />
            ))}
          </div>
        </div>

        {/* Usage Notes */}
        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Usage Notes
          </h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>• These colors are defined as CSS custom properties in the site's stylesheet</li>
            <li>• The theme automatically switches between light and dark variants based on user preference</li>
            <li>• All colors are designed to meet WCAG accessibility standards for contrast</li>
            <li>• Use Primary colors for interactive elements and branding</li>
            <li>• Use Accent colors sparingly for highlights and call-to-action elements</li>
          </ul>
        </div>
      </div>
    </SectionContainer>
  )
}