// components/contact/OfficeLocation.tsx
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

const OfficeLocation = () => {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Our Location
      </h2>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">

        {/* Google Map Embed */}
        <div className="relative h-[450px]">
          <iframe src="https://www.google.com/maps/embed?pb=!4v1772647825850!6m8!1m7!1sGF6mZ8VOLWuZmqdTeFk8yA!2m2!1d-1.951355287997075!2d30.06024768600621!3f316.74776684025295!4f-1.6775114435375116!5f0.7820865974627469"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <a
              href="https://maps.app.goo.gl/ZenabDkVgAFKWpBV7"
              target="_blank"
              rel="noreferrer"
              className="bg-white dark:bg-gray-900 p-2 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Navigation className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </a>
          </div>
        </div>

        {/* Location Info */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-4">

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Norrsken House Kigali
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  KN 78 St, Kigali, Rwanda
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <a
                href="https://maps.app.goo.gl/ZenabDkVgAFKWpBV7"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-colors flex items-center"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </a>

              <a
                href="https://maps.app.goo.gl/ZenabDkVgAFKWpBV7"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Nearby Landmarks */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-cyan-600" />
              Nearby landmarks:
            </p>

            <div className="flex flex-wrap gap-3">
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                Kigali Heights
              </span>

              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                Kigali Convention Centre
              </span>

              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                BK Arena
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default OfficeLocation;