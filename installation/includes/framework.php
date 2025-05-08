<?php

/**
 * @package     Joomla.Installation
 * @subpackage  Application
 *
 * @copyright   (C) 2005 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

\defined('_JEXEC') or die;

use Symfony\Component\Dotenv\Dotenv;

// Check if a configuration file already exists.
if (
    file_exists(JPATH_CONFIGURATION . '/configuration.php')
    && (filesize(JPATH_CONFIGURATION . '/configuration.php') > 10)
    && !file_exists(JPATH_INSTALLATION . '/index.php')
) {
    header('Location: ../index.php');
    exit();
}

// Import the Joomla Platform.
require_once JPATH_LIBRARIES . '/bootstrap.php';

// Load .env files
if (file_exists(JPATH_ROOT . '/.env.local.php') || file_exists(JPATH_ROOT . '/.env')) {
    (new Dotenv('JOOMLA_ENV', 'JOOMLA_DEBUG'))->bootEnv(JPATH_ROOT . '/.env', 'prod');
}

// Ensure sensible default for JDEBUG is set.
\define('JDEBUG', (bool) ($_SERVER['JOOMLA_DEBUG'] ?? getenv('JOOMLA_DEBUG')));

// If debug mode enabled, set new Exception handler with debug enabled.
if (JDEBUG) {
    $errorHandler->setExceptionHandler(
        [
            new \Symfony\Component\ErrorHandler\ErrorHandler(null, true),
            'renderException',
        ]
    );
}
