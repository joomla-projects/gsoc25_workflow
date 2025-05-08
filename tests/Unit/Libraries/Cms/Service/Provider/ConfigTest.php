<?php

/**
 * @package     Joomla.UnitTest
 * @subpackage  Service
 *
 * @copyright   (C) 2025 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\Tests\Unit\Libraries\Cms\Service\Provider;

use Joomla\CMS\Service\Provider\Config;
use Joomla\DI\Container;
use Joomla\Tests\Unit\UnitTestCase;

/**
 * Test class for Config.
 *
 * @package     Joomla.UnitTest
 * @subpackage  Service
 * @since       __DEPLOY_VERSION__
 *
 * @backupGlobals enabled
 */
class ConfigTest extends UnitTestCase
{
    /**
     * @testdox Loads config values from environment
     *
     * @return  void
     *
     * @since   __DEPLOY_VERSION__
     * @covers  Config::loadEnvs
     */
    public function testLoadEnvs(): void
    {
        $container = new Container();
        $container->registerServiceProvider(new Config());

        $_SERVER['JOOMLA_DEBUG']    = '1';
        $_SERVER['JOOMLA_ASSET_ID'] = '42';
        $_SERVER['JOOMLA_HOST']     = '127.0.0.1';

        $config = $container->get('config');

        $this->assertSame($config->get('debug'), true);
        $this->assertSame($config->get('asset_id'), 42);
        $this->assertSame($config->get('host'), '127.0.0.1');
    }

    /**
     * @testdox Uses aliases for some inconsistent envs names
     *
     * @return  void
     *
     * @since   __DEPLOY_VERSION__
     * @covers  Config::loadEnvs
     */
    public function testLoadEnvsAliases(): void
    {
        $container = new Container();
        $container->registerServiceProvider(new Config());

        $_SERVER['JOOMLA_DBHOST']     = 'dbhost';
        $_SERVER['JOOMLA_DBNAME']     = 'dbname';
        $_SERVER['JOOMLA_DBUSER']     = 'dbuser';
        $_SERVER['JOOMLA_DBPASSWORD'] = 'dbpassword';

        $_SERVER['JOOMLA_META_AUTHOR']  = '1';
        $_SERVER['JOOMLA_META_DESC']    = 'metadesc';
        $_SERVER['JOOMLA_META_RIGHTS']  = 'metarights';
        $_SERVER['JOOMLA_META_VERSION'] = '0';

        $_SERVER['JOOMLA_SESSION_LIFETIME'] = '1000';

        $_SERVER['JOOMLA_LOCALE_OFFSET'] = 'UTC';

        $config = $container->get('config');

        $this->assertSame($config->get('host'), 'dbhost');
        $this->assertSame($config->get('db'), 'dbname');
        $this->assertSame($config->get('user'), 'dbuser');
        $this->assertSame($config->get('password'), 'dbpassword');

        $this->assertSame($config->get('MetaAuthor'), true);
        $this->assertSame($config->get('MetaDesc'), 'metadesc');
        $this->assertSame($config->get('MetaRights'), 'metarights');
        $this->assertSame($config->get('MetaVersion'), false);

        $this->assertSame($config->get('offset'), 'UTC');
    }
}
