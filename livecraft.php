<?php
/**
 * Plugin Name: Livecraft
 * Plugin URI:  https://github.com/tpaksu/livecraft
 * Description: Edit your WordPress content directly on the frontend. Click any block, edit it inline, save without leaving the page.
 * Version:     0.1.3
 * Author:      Taha Paksu
 * Author URI:  https://github.com/tpaksu
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: livecraft
 * Requires at least: 6.4
 * Requires PHP: 7.4
 *
 * @package Livecraft
 */

defined( 'ABSPATH' ) || exit;

define( 'LIVECRAFT_VERSION', '0.1.3' );
define( 'LIVECRAFT_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'LIVECRAFT_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once LIVECRAFT_PLUGIN_DIR . 'includes/class-livecraft.php';

add_action(
	'plugins_loaded',
	static function () {
		( new Livecraft() )->init();
	}
);
