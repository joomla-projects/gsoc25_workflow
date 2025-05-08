<?php

/**
 * Joomla! Content Management System
 *
 * @copyright  (C) 2018 Open Source Matters, Inc. <https://www.joomla.org>
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\CMS\Service\Provider;

use Joomla\DI\Container;
use Joomla\DI\ServiceProviderInterface;
use Joomla\Registry\Registry;

// phpcs:disable PSR1.Files.SideEffects
\defined('_JEXEC') or die;
// phpcs:enable PSR1.Files.SideEffects

/**
 * Service provider for the application's config dependency
 *
 * @since  4.0.0
 */
class Config implements ServiceProviderInterface
{
    /**
     * Registers the service provider with a DI container.
     *
     * @param   Container  $container  The DI container.
     *
     * @return  void
     *
     * @since   4.0.0
     */
    public function register(Container $container)
    {
        $container->alias('config', 'JConfig')
            ->share(
                'JConfig',
                function (Container $container) {
                    if (!is_file(JPATH_CONFIGURATION . '/configuration.php')) {
                        return (new Registry())->merge($this->loadEnvs());
                    }

                    \JLoader::register('JConfig', JPATH_CONFIGURATION . '/configuration.php');

                    if (!class_exists('JConfig')) {
                        throw new \RuntimeException('Configuration class does not exist.');
                    }

                    return (new Registry(new \JConfig()))->merge($this->loadEnvs());
                },
                true
            );
    }

    /**
     * Load and process configuration from environment variables.
     *
     * @return  Registry
     *
     * @since   __DEPLOY_VERSION__
     */
    private function loadEnvs(): Registry
    {
        // getenv() is not thread-safe and it can cause segmentaion fault, so we should try $_SERVER first
        $envs = !empty($_SERVER) ? $_SERVER : getenv();

        $config = new Registry();

        /**
         * Some envs names look strange and inconsistent e.g. JOOMLA_LIFETIME, JOOMLA_USER and etc.
         * We add alises for such variables: JOOMLA_SESSION_LIFETIME, JOOMLA_DBUSER and so on.
         */
        $aliases = [
            'dbhost'           => 'host',
            'dbname'           => 'db',
            'dbpassword'       => 'password',
            'dbuser'           => 'user',
            'meta_author'      => 'MetaAuthor',
            'meta_desc'        => 'MetaDesc',
            'meta_rights'      => 'MetaRights',
            'meta_version'     => 'MetaVersion',
            'locale_offset'    => 'offset',
            'session_lifetime' => 'lifetime',
        ];

        foreach ($envs as $envKey => $envValue) {
            if (!str_starts_with($envKey, 'JOOMLA_')) {
                continue;
            }

            $configKey = strtolower(substr($envKey, 7));
            if (isset($aliases[$configKey])) {
                $configKey = $aliases[$configKey];
            }

            $configValue = $envValue;

            // Convert value to an appropriate type
            switch ($configKey) {
                case 'MetaAuthor':
                case 'MetaVersion':
                case 'behind_loadbalancer':
                case 'cache_platformprefix':
                case 'cors':
                case 'dbsslverifyservercert':
                case 'debug':
                case 'debug_lang':
                case 'debug_lang_const':
                case 'gzip':
                case 'mailonline':
                case 'massmailoff':
                case 'memcached_compress':
                case 'memcached_persist':
                case 'offline':
                case 'proxy_enable':
                case 'redis_persist':
                case 'sef':
                case 'sef_rewrite':
                case 'sef_suffix':
                case 'session_metadata':
                case 'shared_session':
                case 'smtpauth':
                case 'unicodeslugs':
                    $configValue = (bool) $configValue;
                    break;
                case 'access':
                case 'asset_id':
                case 'cachetime':
                case 'caching':
                case 'captcha':
                case 'dbencryption':
                case 'display_offline_message':
                case 'feed_limit':
                case 'force_ssl':
                case 'frontediting':
                case 'lifetime':
                case 'list_limit':
                case 'log_category_mode':
                case 'log_deprecated':
                case 'log_everything':
                case 'memcached_server_port':
                case 'redis_server_db':
                case 'redis_server_port':
                case 'session_memcached_server_port':
                case 'session_redis_persist':
                case 'session_redis_server_db':
                case 'session_redis_server_port':
                case 'sitename_pagetitles':
                case 'smtpport':
                    $configValue = (int) $configValue;
                    break;
                case 'log_priorities':
                    $configValue = json_decode($configValue, true);
            }

            $config->set($configKey, $configValue);
        }

        return $config;
    }
}
